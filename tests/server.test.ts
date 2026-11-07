import test from 'node:test';
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {access, mkdtemp, rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import Database from 'better-sqlite3';
import {createApp} from '../server/app.js';
import {getServerConfig} from '../server/config.js';
import {createDb} from '../server/db.js';

async function createTestContext() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'gym-api-'));
  const dbPath = path.join(tempDir, 'gym.db');
  const db = createDb({dbPath});
  const app = createApp({
    env: {NODE_ENV: 'test', JWT_SECRET: 'test-secret'},
    db,
    enableStatic: false,
  });

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Server did not start on a TCP port');

  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    db,
    dbPath,
    baseUrl,
    async close() {
      await new Promise((resolve, reject) => {
        server.close(error => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
      db.close();
      await rm(tempDir, {recursive: true, force: true});
    },
  };
}

async function createCustomTestContext(env: Record<string, string>) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'gym-api-custom-'));
  const dbPath = path.join(tempDir, 'gym.db');
  const db = createDb({dbPath});
  const app = createApp({
    env,
    db,
    enableStatic: false,
  });

  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');

  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Server did not start on a TCP port');

  const baseUrl = `http://127.0.0.1:${address.port}`;

  return {
    db,
    dbPath,
    baseUrl,
    async close() {
      await new Promise((resolve, reject) => {
        server.close(error => {
          if (error) reject(error);
          else resolve(undefined);
        });
      });
      db.close();
      await rm(tempDir, {recursive: true, force: true});
    },
  };
}

async function requestJson(baseUrl: string, pathname: string, init?: RequestInit) {
  const response = await fetch(`${baseUrl}${pathname}`, init);
  const body = await response.json();
  return {response, body};
}

test('getServerConfig requires JWT_SECRET when NODE_ENV is not development', () => {
  assert.throws(() => getServerConfig({NODE_ENV: 'test'}), /JWT_SECRET is required/);
});

test('getServerConfig enables file workspace by default only in development', () => {
  assert.equal(getServerConfig({NODE_ENV: 'development'}).enableFileWorkspace, true);
  assert.equal(getServerConfig({NODE_ENV: 'test', JWT_SECRET: 'x'}).enableFileWorkspace, false);
  assert.equal(
    getServerConfig({NODE_ENV: 'test', JWT_SECRET: 'x', ENABLE_FILE_WORKSPACE: '1'})
      .enableFileWorkspace,
    true,
  );
});

test('SEED_JOURNAL_DEMO is rejected outside development', () => {
  assert.throws(
    () =>
      createApp({
        env: {NODE_ENV: 'test', JWT_SECRET: 'test-secret', SEED_JOURNAL_DEMO: '1'},
        db: createDb({dbPath: ':memory:'}),
        enableStatic: false,
      }),
    /SEED_JOURNAL_DEMO is only allowed/,
  );
});

test('CORS allowlist rejects disallowed Origin', async t => {
  const ctx = await createCustomTestContext({
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    CORS_ORIGINS: 'https://allowed.example',
  });
  t.after(async () => ctx.close());

  const blocked = await fetch(`${ctx.baseUrl}/api/health`, {
    headers: {Origin: 'https://evil.example'},
  });
  assert.equal(blocked.status, 403);

  const allowed = await fetch(`${ctx.baseUrl}/api/health`, {
    headers: {Origin: 'https://allowed.example'},
  });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://allowed.example');
});

test('file workspace routes return 404 when disabled', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'FilesUser', password: 'squat123'}),
  });
  const token = register.body.token as string;

  const files = await requestJson(ctx.baseUrl, '/api/files/workspace', {
    headers: {Authorization: `Bearer ${token}`},
  });
  assert.equal(files.response.status, 404);
  assert.match(files.body.error, /отключён/);
});

test('file workspace list returns relative paths when enabled', async t => {
  const ctx = await createCustomTestContext({
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    ENABLE_FILE_WORKSPACE: '1',
  });
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'FilesOn', password: 'squat123'}),
  });
  const token = register.body.token as string;

  const files = await requestJson(ctx.baseUrl, '/api/files/workspace', {
    headers: {Authorization: `Bearer ${token}`},
  });
  assert.equal(files.response.status, 200);
  assert.equal(files.body.paths.inboxDir, 'workspace-files/inbox');
  assert.equal(files.body.paths.baseDir, 'workspace-files');
  assert.ok(!String(files.body.paths.inboxDir).startsWith('/'));
});

test('createDb respects DB_PATH from env when dbPath is omitted', async t => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'gym-db-env-'));
  const dbPath = path.join(tempDir, 'nested', 'gym.db');
  const db = createDb({env: {DB_PATH: dbPath}});

  t.after(async () => {
    db.close();
    await rm(tempDir, {recursive: true, force: true});
  });

  db.createUser('Steve', 'hash');
  await access(dbPath);
});

test('register rejects passwords that do not meet policy', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const short = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'PolicyUser', password: 'abc'}),
  });

  assert.equal(short.response.status, 400);
  assert.match(short.body.error, /8 символов/);
});

test('auth endpoints and protected user lifecycle work with validated payloads', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'squat123'}),
  });

  assert.equal(register.response.status, 200);
  assert.equal(register.body.name, 'Steve');
  assert.ok(typeof register.body.token === 'string');

  const payload = {
    name: 'Steve',
    exercises: [
      {
        exerciseKey: 'bench',
        testWeight: 100,
        testReps: 5,
        oneRM: 118.9,
        date: '17.03.2026',
      },
    ],
    trainingProgress: {completedSessions: 2},
  };

  const put = await requestJson(ctx.baseUrl, '/api/users/Steve', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${register.body.token}`,
    },
    body: JSON.stringify(payload),
  });

  assert.equal(put.response.status, 200);
  assert.deepEqual(put.body, {ok: true});

  const get = await requestJson(ctx.baseUrl, '/api/users/Steve', {
    headers: {Authorization: `Bearer ${register.body.token}`},
  });

  assert.equal(get.response.status, 200);
  assert.deepEqual(get.body, payload);

  const login = await requestJson(ctx.baseUrl, '/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'squat123'}),
  });

  assert.equal(login.response.status, 200);
  assert.equal(login.body.name, 'Steve');
  assert.ok(typeof login.body.token === 'string');
});

test('register endpoint validates required fields and duplicate users', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const missingName = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({password: 'squat123'}),
  });
  assert.equal(missingName.response.status, 400);
  assert.equal(missingName.body.error, 'Заполни все поля');

  const missingPassword = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve'}),
  });
  assert.equal(missingPassword.response.status, 400);
  assert.equal(missingPassword.body.error, 'Заполни все поля');

  const shortName = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: ' A ', password: 'squat123'}),
  });
  assert.equal(shortName.response.status, 400);
  assert.equal(shortName.body.error, 'Имя минимум 2 символа');

  const shortPassword = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: '123'}),
  });
  assert.equal(shortPassword.response.status, 400);
  assert.equal(shortPassword.body.error, 'Пароль минимум 8 символов');

  const created = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: ' Steve ', password: 'squat123'}),
  });
  assert.equal(created.response.status, 200);
  assert.equal(created.body.name, 'Steve');

  const duplicate = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'another-pass'}),
  });
  assert.equal(duplicate.response.status, 409);
  assert.equal(duplicate.body.error, 'Такое имя уже занято. Придумай другое.');
});

test('PUT /api/users/:name rejects malformed or mismatched user payloads', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'squat123'}),
  });

  const invalid = await requestJson(ctx.baseUrl, '/api/users/Steve', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${register.body.token}`,
    },
    body: JSON.stringify({
      name: 'NotSteve',
      exercises: [],
    }),
  });

  assert.equal(invalid.response.status, 400);
  assert.match(invalid.body.error, /не совпадает с токеном/i);
});

test('corrupted stored JSON falls back to an empty user shape instead of crashing', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'squat123'}),
  });

  const rawDb = new Database(ctx.dbPath);
  rawDb.prepare('UPDATE users SET data = ? WHERE name = ?').run('{broken-json', 'Steve');
  rawDb.close();

  const get = await requestJson(ctx.baseUrl, '/api/users/Steve', {
    headers: {Authorization: `Bearer ${register.body.token}`},
  });

  assert.equal(get.response.status, 200);
  assert.deepEqual(get.body, {name: 'Steve', exercises: []});
});

test('legacy stored user payload is normalized before it reaches the client', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'squat123'}),
  });

  const rawDb = new Database(ctx.dbPath);
  rawDb.prepare('UPDATE users SET data = ? WHERE name = ?').run(
    JSON.stringify({
      name: 'Steve',
      exercises: [
        null,
        {
          exerciseKey: 'bench',
          testWeight: 100,
          testReps: 5,
          oneRM: 118.9,
          date: '17.03.2026',
        },
        {
          exerciseKey: 'row',
          testWeight: 0,
          testReps: 6,
          oneRM: 80,
          date: '17.03.2026',
        },
      ],
      trainingProgress: {completedSessions: 2},
    }),
    'Steve',
  );
  rawDb.close();

  const get = await requestJson(ctx.baseUrl, '/api/users/Steve', {
    headers: {Authorization: `Bearer ${register.body.token}`},
  });

  assert.equal(get.response.status, 200);
  assert.deepEqual(get.body, {
    name: 'Steve',
    exercises: [
      {
        exerciseKey: 'bench',
        testWeight: 100,
        testReps: 5,
        oneRM: 118.9,
        date: '17.03.2026',
      },
    ],
    trainingProgress: {completedSessions: 2},
  });
});

test('development localhost requests bypass auth rate limiting', async t => {
  const ctx = await createCustomTestContext({
    NODE_ENV: 'development',
    LOGIN_MAX_ATTEMPTS: '1',
    AUTH_RATE_LIMIT_WINDOW_MS: '600000',
  });
  t.after(async () => ctx.close());

  await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'squat123'}),
  });

  const wrong1 = await requestJson(ctx.baseUrl, '/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'wrong-pass'}),
  });

  const wrong2 = await requestJson(ctx.baseUrl, '/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'wrong-pass-again'}),
  });

  assert.equal(wrong1.response.status, 401);
  assert.equal(wrong2.response.status, 401);
  assert.equal(wrong2.body.error, 'Неверное имя пользователя или пароль. Проверь написание и попробуй снова.');
});

test('non-development auth rate limiting still blocks repeated failures', async t => {
  const ctx = await createCustomTestContext({
    NODE_ENV: 'test',
    JWT_SECRET: 'test-secret',
    LOGIN_MAX_ATTEMPTS: '1',
    AUTH_RATE_LIMIT_WINDOW_MS: '600000',
  });
  t.after(async () => ctx.close());

  await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'squat123'}),
  });

  const wrong1 = await requestJson(ctx.baseUrl, '/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'wrong-pass'}),
  });

  const wrong2 = await requestJson(ctx.baseUrl, '/api/auth/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'Steve', password: 'wrong-pass-again'}),
  });

  assert.equal(wrong1.response.status, 401);
  assert.equal(wrong2.response.status, 429);
  assert.equal(wrong2.body.error, 'Слишком много попыток. Попробуй позже.');
});

test('PUT /api/users/:name normalizes journal sessions and prunes overflow', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'JournalUser', password: 'squat123'}),
  });

  const token = register.body.token as string;

  const payload = {
    name: 'JournalUser',
    exercises: [
      {
        exerciseKey: 'bench',
        testWeight: 100,
        testReps: 5,
        oneRM: 118.9,
        date: '17.03.2026',
      },
    ],
    journal: [
      {
        id: 'session-1',
        exerciseKey: 'bench',
        date: '2026-05-20',
        createdAt: '2026-05-20T10:00:00.000Z',
        sets: [{setIndex: 1, weight: 80, reps: 8, rpe: 8}],
      },
      {
        id: 'session-1',
        exerciseKey: 'bench',
        date: '2026-05-21',
        createdAt: '2026-05-21T10:00:00.000Z',
        sets: [{setIndex: 1, weight: 85, reps: 6}],
      },
    ],
  };

  const put = await requestJson(ctx.baseUrl, '/api/users/JournalUser', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  assert.equal(put.response.status, 400);
  assert.match(put.body.error, /дублировать id/i);

  const validPut = await requestJson(ctx.baseUrl, '/api/users/JournalUser', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      journal: [payload.journal[0]],
    }),
  });

  assert.equal(validPut.response.status, 200);

  const get = await requestJson(ctx.baseUrl, '/api/users/JournalUser', {
    headers: {Authorization: `Bearer ${token}`},
  });

  assert.equal(get.response.status, 200);
  assert.equal(get.body.journal.length, 1);
  assert.equal(get.body.journal[0].sets[0].weight, 80);
});

test('PUT /api/users/:name normalizes custom splits', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'SplitUser', password: 'squat123'}),
  });

  const token = register.body.token as string;

  const split = {
    id: 'split-1',
    name: 'Клиент А',
    daysPerWeek: 3,
    varyIntensity: true,
    weightMode: 'progression',
    days: [
      {dayNumber: 1, muscles: ['chest', 'biceps']},
      {dayNumber: 2, muscles: ['legs', 'shoulders']},
      {dayNumber: 3, muscles: ['back', 'triceps']},
    ],
    createdAt: '2026-05-20T10:00:00.000Z',
    updatedAt: '2026-05-20T10:00:00.000Z',
  };

  const put = await requestJson(ctx.baseUrl, '/api/users/SplitUser', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'SplitUser',
      exercises: [
        {
          exerciseKey: 'bench',
          testWeight: 100,
          testReps: 5,
          oneRM: 118.9,
          date: '17.03.2026',
        },
      ],
      splits: [split],
      activeSplitId: 'split-1',
    }),
  });

  assert.equal(put.response.status, 200);

  const get = await requestJson(ctx.baseUrl, '/api/users/SplitUser', {
    headers: {Authorization: `Bearer ${token}`},
  });

  assert.equal(get.response.status, 200);
  assert.equal(get.body.splits.length, 1);
  assert.equal(get.body.splits[0].name, 'Клиент А');
  assert.equal(get.body.activeSplitId, 'split-1');
});

test('PUT /api/users/:name persists split completedWeeks and completedDays', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'WeekProgressUser', password: 'squat123'}),
  });

  const token = register.body.token as string;

  const split = {
    id: 'split-progress-1',
    name: 'Прогресс',
    daysPerWeek: 3,
    varyIntensity: true,
    weightMode: 'progression',
    days: [
      {dayNumber: 1, muscles: ['chest', 'biceps']},
      {dayNumber: 2, muscles: ['legs', 'shoulders']},
      {dayNumber: 3, muscles: ['back', 'triceps']},
    ],
    completedWeeks: [0, 1, 2, 3],
    completedDays: [
      {week: 0, day: 1},
      {week: 1, day: 2},
    ],
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-04T12:00:00.000Z',
  };

  const put = await requestJson(ctx.baseUrl, '/api/users/WeekProgressUser', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'WeekProgressUser',
      exercises: [],
      splits: [split],
      activeSplitId: 'split-progress-1',
    }),
  });

  assert.equal(put.response.status, 200);

  const get = await requestJson(ctx.baseUrl, '/api/users/WeekProgressUser', {
    headers: {Authorization: `Bearer ${token}`},
  });

  assert.equal(get.response.status, 200);
  assert.deepEqual(get.body.splits[0].completedWeeks, [0, 1, 2, 3]);
  assert.deepEqual(get.body.splits[0].completedDays, [
    {week: 0, day: 1},
    {week: 1, day: 2},
  ]);
});

test('PUT /api/users/:name persists per-user split calculation history', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'CalculationHistoryUser', password: 'squat123'}),
  });
  const token = register.body.token as string;
  const split = {
    id: 'split-history-1',
    name: 'Силовой сплит',
    daysPerWeek: 2,
    varyIntensity: true,
    weightMode: 'progression',
    days: [
      {dayNumber: 1, muscles: ['chest', 'biceps']},
      {dayNumber: 2, muscles: ['legs', 'back']},
    ],
    completedWeeks: [0, 1],
    completedDays: [
      {week: 0, day: 1},
      {week: 0, day: 2},
    ],
    createdAt: '2026-08-05T10:00:00.000Z',
    updatedAt: '2026-08-05T11:00:00.000Z',
  };

  const put = await requestJson(ctx.baseUrl, '/api/users/CalculationHistoryUser', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'CalculationHistoryUser',
      exercises: [],
      splits: [{...split, completedWeeks: undefined, completedDays: undefined}],
      activeSplitId: split.id,
      splitCalculations: [
        {
          id: 'calculation-1',
          calculatedAt: '2026-08-05T10:30:00.000Z',
          split,
          exercises: [
            {
              exerciseKey: 'bench',
              testWeight: 100,
              testReps: 5,
              oneRM: 116.7,
              date: '05.08.2026',
            },
          ],
        },
      ],
      activeSplitCalculationId: 'calculation-1',
    }),
  });

  assert.equal(put.response.status, 200);

  const get = await requestJson(ctx.baseUrl, '/api/users/CalculationHistoryUser', {
    headers: {Authorization: `Bearer ${token}`},
  });

  assert.equal(get.response.status, 200);
  assert.equal(get.body.activeSplitCalculationId, 'calculation-1');
  assert.equal(get.body.splitCalculations.length, 1);
  assert.equal(get.body.splitCalculations[0].split.name, 'Силовой сплит');
  assert.deepEqual(get.body.splitCalculations[0].split.completedWeeks, [0, 1]);
  assert.equal(get.body.splitCalculations[0].exercises[0].oneRM, 116.7);
});

test('PUT /api/users/:name keeps profiles and does not drop another profile split', async t => {
  const ctx = await createTestContext();
  t.after(async () => ctx.close());

  const register = await requestJson(ctx.baseUrl, '/api/auth/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: 'ProfileUser', password: 'squat123'}),
  });
  const token = register.body.token as string;

  const days = [
    {dayNumber: 1, muscles: ['chest', 'biceps']},
    {dayNumber: 2, muscles: ['legs', 'back']},
  ];
  const stamp = '2026-10-10T10:00:00.000Z';

  const put = await requestJson(ctx.baseUrl, '/api/users/ProfileUser', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: 'ProfileUser',
      exercises: [],
      profiles: [
        {id: 'profile-ivanov', name: 'Иванов', createdAt: stamp, updatedAt: stamp},
        {id: 'profile-petrov', name: 'Петров', createdAt: stamp, updatedAt: stamp},
      ],
      activeProfileId: 'profile-ivanov',
      splits: [
        {
          id: 'split-old',
          name: 'Старый',
          daysPerWeek: 2,
          varyIntensity: true,
          weightMode: 'progression',
          days,
          createdAt: stamp,
          updatedAt: stamp,
        },
        {
          id: 'split-petrov',
          profileId: 'profile-petrov',
          name: 'Тяга',
          daysPerWeek: 2,
          varyIntensity: true,
          weightMode: 'progression',
          days,
          createdAt: stamp,
          updatedAt: stamp,
        },
      ],
    }),
  });

  assert.equal(put.response.status, 200);

  const get = await requestJson(ctx.baseUrl, '/api/users/ProfileUser', {
    headers: {Authorization: `Bearer ${token}`},
  });

  assert.equal(get.response.status, 200);
  const profiles = get.body.profiles as Array<{id: string; name: string}>;
  const splits = get.body.splits as Array<{id: string; profileId?: string; name: string}>;
  const main = profiles.find(profile => profile.name === 'Основной');
  assert.ok(main);
  assert.equal(splits.find(split => split.id === 'split-old')?.profileId, main?.id);
  assert.equal(splits.find(split => split.id === 'split-petrov')?.profileId, 'profile-petrov');
  assert.equal(profiles.some(profile => profile.id === 'profile-petrov'), true);
  assert.equal(get.body.activeProfileId, 'profile-ivanov');
  assert.equal(splits.length, 2);
});
