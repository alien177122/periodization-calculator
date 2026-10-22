import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {ipKeyGenerator, rateLimit} from 'express-rate-limit';
import {existsSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getServerConfig} from './config.js';
import {createDb} from './db.js';
import {createFileWorkspace} from './file-workspace.js';
import {normalizeStoredUserData, normalizeUserData} from './schema.js';
import {passwordPolicyError} from './passwordPolicy.js';
import {securityHeaders} from './security.js';
import {applyJournalDemoSeed} from './journalDemoSeed.js';
import {computeOneRm, mapHistoryRow, validateCalculationBody} from './calculations.js';
import {
  applyWebhookToDb,
  CHECKOUT_CLIENT_ERROR,
  createInternalPaymentId,
  createPlategaCheckout,
  parsePlategaWebhookBody,
  verifyPlategaWebhookHeaders,
} from './billing.js';

const USERNAME_MAX_LENGTH = 32;
const JWT_SIGN_OPTIONS = {algorithm: 'HS256'};
const JWT_VERIFY_OPTIONS = {algorithms: ['HS256']};

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '..', 'dist');

function normalizedName(req) {
  return typeof req.body?.name === 'string' ? req.body.name.trim().toLowerCase() : '';
}

function requestIp(req) {
  if (req.app && req.app.get('trust proxy')) {
    const cfIp = req.headers['cf-connecting-ip'];
    if (typeof cfIp === 'string' && cfIp.trim()) return cfIp.trim();
  }
  return req.ip || req.socket.remoteAddress || '127.0.0.1';
}

function isLoopbackIp(ip) {
  const normalized = ip.trim().toLowerCase();
  return (
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '::ffff:127.0.0.1' ||
    normalized === 'localhost'
  );
}

function limitExceeded(_req, res) {
  return res.status(429).json({error: 'Слишком много попыток. Попробуй позже.'});
}

function makeIpLimiter(scope, limit, config) {
  return rateLimit({
    windowMs: config.authWindowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skip: req => config.isDevelopment && isLoopbackIp(requestIp(req)),
    keyGenerator: req => `${scope}:ip:${ipKeyGenerator(requestIp(req))}`,
    handler: limitExceeded,
  });
}

function makeNameLimiter(scope, limit, config) {
  return rateLimit({
    windowMs: config.authWindowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    skip: req => config.isDevelopment && isLoopbackIp(requestIp(req)),
    keyGenerator: req => `${scope}:name:${normalizedName(req) || ipKeyGenerator(requestIp(req))}`,
    handler: limitExceeded,
  });
}

function resetLimiters(req, scope, ipLimiter, nameLimiter) {
  ipLimiter.resetKey(`${scope}:ip:${ipKeyGenerator(requestIp(req))}`);
  nameLimiter.resetKey(`${scope}:name:${normalizedName(req) || ipKeyGenerator(requestIp(req))}`);
}

function createCorsMiddleware(config) {
  const allowlist = config.corsOrigins;

  // Development without CORS_ORIGINS: reflect request origin (local Vite / Capacitor).
  // Non-development without allowlist: same-origin only (no Access-Control-Allow-Origin).
  if (allowlist.length === 0) {
    if (config.isDevelopment) {
      return cors({origin: true});
    }
    return cors({origin: false});
  }

  return cors({
    origin(origin, callback) {
      // Non-browser / same-origin requests often omit Origin.
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowlist.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  });
}

export function createApp({
  env = process.env,
  db = createDb({env}),
  enableStatic = existsSync(distDir),
  fetchImpl = fetch,
} = {}) {
  const config = getServerConfig(env);
  const app = express();
  app.disable('x-powered-by');

  if (env.TRUST_PROXY === '1' || env.TRUST_PROXY === 'true') {
    app.set('trust proxy', true);
  }

  const fileWorkspace = createFileWorkspace({env});

  if (env.SEED_TEST_NAME && env.SEED_TEST_HASH) {
    db.seedUser(env.SEED_TEST_NAME, env.SEED_TEST_HASH);
  }

  // Known demo password in repo — never seed outside development (audit V-05).
  if (env.SEED_JOURNAL_DEMO === '1') {
    if (!config.isDevelopment) {
      throw new Error(
        'SEED_JOURNAL_DEMO is only allowed when NODE_ENV=development (known demo password)',
      );
    }
    void applyJournalDemoSeed(db, bcrypt);
  }

  const loginIpLimiter = makeIpLimiter('login', config.loginMaxAttempts, config);
  const loginNameLimiter = makeNameLimiter('login', config.loginMaxAttempts, config);
  const registerIpLimiter = makeIpLimiter('register', config.registerMaxAttempts, config);
  const registerNameLimiter = makeNameLimiter('register', config.registerMaxAttempts, config);

  app.use(createCorsMiddleware(config));
  app.use(express.json({limit: '256kb'}));
  app.use(securityHeaders(config));

  function authAny(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({error: 'Нет токена'});
    }

    try {
      const payload = jwt.verify(token, config.jwtSecret, JWT_VERIFY_OPTIONS);
      const name = typeof payload?.name === 'string' ? payload.name : '';
      if (!name) return res.status(401).json({error: 'Токен недействителен'});

      const tokenVersion = Number(payload.tv);
      const currentVersion = db.getTokenVersion(name);
      if (currentVersion === null) {
        return res.status(401).json({error: 'Токен недействителен'});
      }
      if (!Number.isFinite(tokenVersion) || tokenVersion !== currentVersion) {
        return res.status(401).json({error: 'Токен недействителен'});
      }

      req.user = {name, tv: currentVersion};
      next();
    } catch {
      res.status(401).json({error: 'Токен недействителен'});
    }
  }

  function auth(req, res, next) {
    authAny(req, res, () => {
      if (req.user.name !== req.params.name) {
        res.status(403).json({error: 'Доступ запрещён'});
        return;
      }
      next();
    });
  }

  function requireFileWorkspace(_req, res, next) {
    if (!config.enableFileWorkspace) {
      res.status(404).json({error: 'File workspace отключён'});
      return;
    }
    next();
  }

  function signAccessToken(name, tokenVersion) {
    return jwt.sign({name, tv: tokenVersion}, config.jwtSecret, {
      ...JWT_SIGN_OPTIONS,
      expiresIn: config.jwtExpiresIn,
    });
  }

  // CORS errors from the origin callback surface as Error — map to 403 JSON.
  app.use((err, _req, res, next) => {
    if (err instanceof Error && err.message.startsWith('CORS blocked')) {
      res.status(403).json({error: 'CORS: origin не разрешён'});
      return;
    }
    next(err);
  });

  app.post('/api/auth/register', registerIpLimiter, registerNameLimiter, async (req, res) => {
    const {name, password} = req.body;
    if (!name?.trim() || !password) return res.status(400).json({error: 'Заполни все поля'});
    const trimmedName = name.trim();
    if (trimmedName.length < 2) return res.status(400).json({error: 'Имя минимум 2 символа'});
    if (trimmedName.length > USERNAME_MAX_LENGTH) {
      return res.status(400).json({error: `Имя не длиннее ${USERNAME_MAX_LENGTH} символов`});
    }
    const policyError = passwordPolicyError(password);
    if (policyError) return res.status(400).json({error: policyError});
    if (db.userExists(trimmedName))
      return res.status(409).json({error: 'Пользователь уже существует'});

    const hash = await bcrypt.hash(password, 10);
    db.createUser(trimmedName, hash);
    resetLimiters(req, 'register', registerIpLimiter, registerNameLimiter);
    const token = signAccessToken(trimmedName, 0);
    res.json({token, name: trimmedName});
  });

  // Fixed bcrypt hash for timing parity when user is missing (not a real password).
  const LOGIN_DUMMY_HASH = '$2b$10$w1wsmd0bMGWpp2QdTT3Td.lADekYlXEFrxYKU39XTEk9xqWQrcrY2';
  const LOGIN_ERROR = 'Неверный логин или пароль';

  app.post('/api/auth/login', loginIpLimiter, loginNameLimiter, async (req, res) => {
    const {name, password} = req.body;
    if (!name?.trim() || !password) return res.status(400).json({error: 'Заполни все поля'});

    const row = db.getUserAuth(name.trim());
    const hash = row?.password_hash || LOGIN_DUMMY_HASH;
    const ok = row ? await bcrypt.compare(password, hash) : false;
    // Always run a compare against dummy when missing user (timing).
    if (!row) await bcrypt.compare(password, LOGIN_DUMMY_HASH);

    if (!row || !ok) {
      return res.status(401).json({error: LOGIN_ERROR});
    }

    resetLimiters(req, 'login', loginIpLimiter, loginNameLimiter);
    const tv = Number(row.token_version) || 0;
    const token = signAccessToken(row.name, tv);
    res.json({token, name: row.name});
  });

  app.post('/api/auth/logout', authAny, (req, res) => {
    db.bumpTokenVersion(req.user.name);
    res.json({ok: true});
  });

  app.get('/api/health', (_req, res) => {
    res.json({ok: true});
  });

  app.get('/api/users/:name', auth, (req, res) => {
    const data = db.getUser(req.params.name);
    res.json(normalizeStoredUserData(data, req.params.name));
  });

  app.put('/api/users/:name', auth, (req, res) => {
    const parsed = normalizeUserData(req.body, req.params.name);
    if (parsed.error) return res.status(400).json({error: parsed.error});

    db.putUser(req.params.name, parsed.data);
    res.json({ok: true});
  });

  app.delete('/api/users/:name', auth, (req, res) => {
    db.delUser(req.params.name);
    res.json({ok: true});
  });

  app.get('/api/billing/status', authAny, (req, res) => {
    res.json(getBillingStatusPayload(req.user.name));
  });

  app.post('/api/billing/checkout', authAny, async (req, res) => {
    if (!config.plategaEnabled) {
      return res.status(503).json({error: 'Оплата отключена в этой среде'});
    }

    try {
      const paymentId = createInternalPaymentId();
      db.createBillingPayment({
        id: paymentId,
        userName: req.user.name,
        amount: config.plategaPriceRub,
        currency: 'RUB',
        status: 'PENDING',
        providerTransactionId: null,
      });

      const checkout = await createPlategaCheckout({
        config,
        userName: req.user.name,
        paymentId,
        fetchImpl,
      });

      db.updateBillingPaymentStatus(paymentId, 'PENDING', checkout.transactionId);

      res.json({
        transactionId: checkout.transactionId,
        paymentUrl: checkout.paymentUrl,
      });
    } catch {
      res.status(502).json({error: CHECKOUT_CLIENT_ERROR});
    }
  });

  app.post('/api/billing/webhook', (req, res) => {
    if (!config.plategaEnabled) {
      return res.status(404).json({error: 'Billing disabled'});
    }
    if (!verifyPlategaWebhookHeaders(req, config)) {
      return res.status(401).json({error: 'Unauthorized webhook'});
    }

    const parsed = parsePlategaWebhookBody(req.body);
    if (parsed.error) {
      return res.status(400).json({error: parsed.error});
    }

    const result = applyWebhookToDb(db, parsed, config);
    if (!result.ok) {
      const status = result.reason === 'payment_not_found' ? 404 : 400;
      return res.status(status).json({error: result.reason});
    }
    res.json({ok: true});
  });

  app.post('/api/calculator/calculate', authAny, (req, res) => {
    const validated = validateCalculationBody(req.body);
    if (validated.error) {
      return res.status(400).json({error: validated.error});
    }

    const computed = computeOneRm(validated.payload);
    if (computed.error) {
      return res.status(400).json({error: computed.error});
    }

    const outcome = db.runConsumeCalculation(
      req.user.name,
      {...validated.payload, freeLimit: config.freeCalculationLimit},
      computed,
      !config.plategaEnabled,
    );

    if (outcome.type === 'conflict') {
      return res.status(409).json({error: 'Конфликт requestId'});
    }

    if (outcome.type === 'limit') {
      return res.status(402).json({error: 'CALCULATION_LIMIT_REACHED', remaining: 0});
    }

    res.json(outcome.result);
  });

  app.get('/api/calculator/history', authAny, (req, res) => {
    const rows = db.listCalculationHistory(req.user.name);
    res.json(rows.map(mapHistoryRow));
  });

  function getBillingStatusPayload(userName) {
    const snapshot = db.getBillingSnapshot(userName, config);
    return {
      premium: snapshot.premium,
      freeLimit: snapshot.freeLimit,
      used: snapshot.used,
      remaining: snapshot.remaining,
      price: snapshot.price,
      currency: snapshot.currency,
      pendingPayment: snapshot.pendingPayment,
    };
  }

  app.get('/api/files/workspace', authAny, requireFileWorkspace, async (req, res) => {
    res.json(await fileWorkspace.listFiles(req.user.name));
  });

  app.post('/api/files/workspace/analyze', authAny, requireFileWorkspace, async (req, res) => {
    res.json(await fileWorkspace.analyzeAllFiles(req.user.name));
  });

  app.post(
    '/api/files/workspace/analyze/:name',
    authAny,
    requireFileWorkspace,
    async (req, res) => {
      try {
        await fileWorkspace.analyzeFile(req.params.name, req.user.name);
        res.json(await fileWorkspace.listFiles(req.user.name));
      } catch (err) {
        if (err instanceof Error && err.message.includes('Access denied')) {
          res.status(400).json({error: err.message});
        } else {
          res.status(500).json({error: 'Ошибка при анализе файла'});
        }
      }
    },
  );

  if (enableStatic) {
    app.use(express.static(distDir));
    app.get(/^(?!\/api(?:\/|$)).*/, (_req, res) => {
      res.sendFile(join(distDir, 'index.html'));
    });
  }

  app.locals.config = config;
  app.locals.db = db;
  return app;
}
