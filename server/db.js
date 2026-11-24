import Database from 'better-sqlite3';
import {mkdirSync} from 'fs';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'url';
import {dirname, join, resolve} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fallbackDbPath = join(__dirname, '..', 'gym.db');

function getDefaultDbPath(env = process.env) {
  const configuredDbPath = env.DB_PATH?.trim();
  return configuredDbPath || fallbackDbPath;
}

function safeParseUserData(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function resolveDbPath(rawPath, env = process.env) {
  const configuredPath = dbPathOrDefault(rawPath, env);
  return configuredPath === ':memory:' ? configuredPath : resolve(configuredPath);
}

function dbPathOrDefault(rawPath, env = process.env) {
  return rawPath || getDefaultDbPath(env);
}

export function createDb({dbPath, env = process.env} = {}) {
  const resolvedDbPath = resolveDbPath(dbPath, env);
  if (resolvedDbPath !== ':memory:') {
    mkdirSync(dirname(resolvedDbPath), {recursive: true});
  }

  const db = new Database(resolvedDbPath);

  db.exec(`CREATE TABLE IF NOT EXISTS users (
    name          TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    data          TEXT NOT NULL DEFAULT '{}'
  )`);

  // Phase 2 interim: revoke access tokens on logout via bumpable version.
  const userCols = db.prepare('PRAGMA table_info(users)').all();
  if (!userCols.some(col => col.name === 'token_version')) {
    db.exec('ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0');
  }
  if (!userCols.some(col => col.name === 'premium')) {
    db.exec('ALTER TABLE users ADD COLUMN premium INTEGER NOT NULL DEFAULT 0');
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS calculation_attempts (
      id              TEXT PRIMARY KEY,
      user_name       TEXT NOT NULL,
      request_id      TEXT NOT NULL,
      exercise_key    TEXT NOT NULL,
      test_weight     REAL NOT NULL,
      test_reps       INTEGER NOT NULL,
      body_weight     REAL,
      extra_weight    REAL,
      one_rm          REAL NOT NULL,
      created_at      TEXT NOT NULL,
      UNIQUE(user_name, request_id)
    );

    CREATE INDEX IF NOT EXISTS idx_calc_attempts_user_created
      ON calculation_attempts(user_name, created_at DESC);

    CREATE TABLE IF NOT EXISTS billing_payments (
      id                        TEXT PRIMARY KEY,
      user_name                 TEXT NOT NULL,
      provider_transaction_id   TEXT,
      amount                    INTEGER NOT NULL,
      currency                  TEXT NOT NULL DEFAULT 'RUB',
      status                    TEXT NOT NULL,
      created_at                TEXT NOT NULL,
      updated_at                TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_billing_payments_user
      ON billing_payments(user_name, created_at DESC);

    CREATE UNIQUE INDEX IF NOT EXISTS idx_billing_provider_tx
      ON billing_payments(provider_transaction_id)
      WHERE provider_transaction_id IS NOT NULL;
  `);

  function countCalculationAttempts(userName) {
    const row = db
      .prepare('SELECT COUNT(*) AS count FROM calculation_attempts WHERE user_name = ?')
      .get(userName);
    return Number(row?.count) || 0;
  }

  function getCalculationAttemptByRequestId(userName, requestId) {
    return db
      .prepare(
        `SELECT id, user_name, request_id, exercise_key, test_weight, test_reps,
                body_weight, extra_weight, one_rm, created_at
         FROM calculation_attempts
         WHERE user_name = ? AND request_id = ?`,
      )
      .get(userName, requestId);
  }

  function listCalculationHistory(userName) {
    return db
      .prepare(
        `SELECT id, exercise_key, test_weight, test_reps, body_weight, one_rm, created_at
         FROM calculation_attempts
         WHERE user_name = ?
         ORDER BY created_at DESC`,
      )
      .all(userName);
  }

  function hasPendingPayment(userName) {
    const row = db
      .prepare(
        `SELECT 1 FROM billing_payments
         WHERE user_name = ? AND status IN ('PENDING', 'CREATED')
         LIMIT 1`,
      )
      .get(userName);
    return Boolean(row);
  }

  function getUserPremiumFlag(userName) {
    const row = db.prepare('SELECT premium FROM users WHERE name = ?').get(userName);
    return row ? Number(row.premium) === 1 : false;
  }

  function setUserPremium(userName, premium) {
    db.prepare('UPDATE users SET premium = ? WHERE name = ?').run(premium ? 1 : 0, userName);
  }

  function countConfirmedPayments(userName) {
    const row = db
      .prepare(
        `SELECT COUNT(*) AS count FROM billing_payments
         WHERE user_name = ? AND status = 'CONFIRMED'`,
      )
      .get(userName);
    return Number(row?.count) || 0;
  }

  function recalculatePremiumAccess(userName) {
    const confirmed = countConfirmedPayments(userName);
    setUserPremium(userName, confirmed > 0);
    return confirmed > 0;
  }

  function createBillingPayment({id, userName, amount, currency, status, providerTransactionId}) {
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO billing_payments
        (id, user_name, provider_transaction_id, amount, currency, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, userName, providerTransactionId ?? null, amount, currency, status, now, now);
  }

  function getBillingPaymentById(id) {
    return db.prepare('SELECT * FROM billing_payments WHERE id = ?').get(id);
  }

  function getBillingPaymentByProviderTransactionId(providerTransactionId) {
    return db
      .prepare('SELECT * FROM billing_payments WHERE provider_transaction_id = ?')
      .get(providerTransactionId);
  }

  function updateBillingPaymentStatus(id, status, providerTransactionId) {
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE billing_payments
       SET status = ?, provider_transaction_id = COALESCE(?, provider_transaction_id), updated_at = ?
       WHERE id = ?`,
    ).run(status, providerTransactionId ?? null, now, id);
  }

  function updateBillingPaymentByProviderId(providerTransactionId, status) {
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE billing_payments SET status = ?, updated_at = ? WHERE provider_transaction_id = ?`,
    ).run(status, now, providerTransactionId);
  }

  function getUserDataRaw(userName) {
    const row = db.prepare('SELECT data FROM users WHERE name = ?').get(userName);
    return row ? safeParseUserData(row.data) : null;
  }

  function mergeSavedExerciseInUserData(userName, savedExercise) {
    const data = getUserDataRaw(userName) ?? {name: userName, exercises: []};
    const exercises = Array.isArray(data.exercises) ? data.exercises : [];
    const nextExercises = [
      ...exercises.filter(item => item?.exerciseKey !== savedExercise.exerciseKey),
      savedExercise,
    ];
    const next = {...data, name: userName, exercises: nextExercises};
    db.prepare('UPDATE users SET data = ? WHERE name = ?').run(JSON.stringify(next), userName);
    return next;
  }

  const insertCalculationAttempt = db.prepare(`
    INSERT INTO calculation_attempts
      (id, user_name, request_id, exercise_key, test_weight, test_reps, body_weight, extra_weight, one_rm, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  function runConsumeCalculation(userName, payload, computed, billingDisabled) {
    return db.transaction(() => {
      const existing = getCalculationAttemptByRequestId(userName, payload.requestId);
      if (existing) {
        const sameInput =
          existing.exercise_key === payload.exerciseKey &&
          existing.test_reps === payload.testReps &&
          Math.abs(existing.test_weight - payload.testWeight) < 0.0001 &&
          (existing.body_weight ?? null) === (payload.bodyWeight ?? null) &&
          (existing.extra_weight ?? 0) === (payload.extraWeight ?? 0);

        if (!sameInput) {
          return {type: 'conflict'};
        }

        return {
          type: 'cached',
          result: {
            exerciseKey: existing.exercise_key,
            testWeight: existing.test_weight,
            testReps: existing.test_reps,
            oneRM: existing.one_rm,
            date: formatRuDate(existing.created_at),
            ...(existing.body_weight != null ? {bodyWeight: existing.body_weight} : {}),
            cached: true,
          },
        };
      }

      const premium = billingDisabled || getUserPremiumFlag(userName);
      if (!premium) {
        const used = countCalculationAttempts(userName);
        if (used >= payload.freeLimit) {
          return {type: 'limit'};
        }
      }

      const attemptId = randomUUID();
      const createdAt = new Date().toISOString();
      insertCalculationAttempt.run(
        attemptId,
        userName,
        payload.requestId,
        payload.exerciseKey,
        payload.testWeight,
        payload.testReps,
        payload.bodyWeight ?? null,
        payload.extraWeight ?? null,
        computed.oneRM,
        createdAt,
      );

      const savedExercise = {
        exerciseKey: payload.exerciseKey,
        testWeight: payload.testWeight,
        testReps: payload.testReps,
        oneRM: computed.oneRM,
        date: formatRuDate(createdAt),
        ...(payload.bodyWeight != null ? {bodyWeight: payload.bodyWeight} : {}),
      };

      mergeSavedExerciseInUserData(userName, savedExercise);

      return {
        type: 'success',
        result: {...savedExercise, cached: false},
      };
    })();
  }

  function formatRuDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString('ru-RU');
  }

  function getBillingSnapshot(userName, config) {
    const billingDisabled = !config.plategaEnabled;
    const premium = billingDisabled || getUserPremiumFlag(userName);
    const freeLimit = config.freeCalculationLimit;
    const used = countCalculationAttempts(userName);
    const remaining = premium ? freeLimit : Math.max(0, freeLimit - used);

    return {
      premium,
      freeLimit,
      used,
      remaining: premium ? freeLimit : remaining,
      price: config.plategaPriceRub,
      currency: 'RUB',
      pendingPayment: config.plategaEnabled ? hasPendingPayment(userName) : false,
      billingDisabled,
    };
  }

  return {
    userExists: name => !!db.prepare('SELECT 1 FROM users WHERE name = ?').get(name),
    getUserAuth: name =>
      db.prepare('SELECT name, password_hash, token_version FROM users WHERE name = ?').get(name),
    createUser: (name, hash) =>
      db
        .prepare('INSERT INTO users (name, password_hash, data, token_version) VALUES (?, ?, ?, 0)')
        .run(name, hash, '{}'),
    seedUser: (name, hash) => {
      const exists = db.prepare('SELECT 1 FROM users WHERE name = ?').get(name);
      if (!exists) {
        db.prepare(
          'INSERT INTO users (name, password_hash, data, token_version) VALUES (?, ?, ?, 0)',
        ).run(name, hash, '{}');
      }
    },
    getTokenVersion: name => {
      const row = db.prepare('SELECT token_version FROM users WHERE name = ?').get(name);
      return row ? Number(row.token_version) || 0 : null;
    },
    bumpTokenVersion: name => {
      db.prepare(
        'UPDATE users SET token_version = COALESCE(token_version, 0) + 1 WHERE name = ?',
      ).run(name);
      const row = db.prepare('SELECT token_version FROM users WHERE name = ?').get(name);
      return row ? Number(row.token_version) || 0 : 0;
    },
    getUser: name => {
      const row = db.prepare('SELECT data FROM users WHERE name = ?').get(name);
      return row ? safeParseUserData(row.data) : null;
    },
    putUser: (name, data) =>
      db.prepare('UPDATE users SET data = ? WHERE name = ?').run(JSON.stringify(data), name),
    delUser: name =>
      db.transaction(() => {
        db.prepare('DELETE FROM calculation_attempts WHERE user_name = ?').run(name);
        db.prepare('DELETE FROM billing_payments WHERE user_name = ?').run(name);
        return db.prepare('DELETE FROM users WHERE name = ?').run(name);
      })(),
    countCalculationAttempts,
    getCalculationAttemptByRequestId,
    listCalculationHistory,
    hasPendingPayment,
    getUserPremiumFlag,
    setUserPremium,
    recalculatePremiumAccess,
    createBillingPayment,
    getBillingPaymentById,
    getBillingPaymentByProviderTransactionId,
    updateBillingPaymentStatus,
    updateBillingPaymentByProviderId,
    runConsumeCalculation,
    getBillingSnapshot,
    getUserDataRaw,
    close: () => db.close(),
  };
}
