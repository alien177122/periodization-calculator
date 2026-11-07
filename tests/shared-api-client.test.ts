import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ApiClientError,
  ApiResponseParseError,
  ApiTimeoutError,
  ApiUnauthorizedError,
  createApiClient,
  normalizeLoadedUser,
} from '../packages/shared/src/api/index.ts';
import {createApiClient as createSessionApiClient} from '../packages/shared/src/utils/api.ts';

function createTestClient(overrides?: {
  onUnauthorized?: () => void | Promise<void>;
  logger?: {log?: (...args: unknown[]) => void; error?: (...args: unknown[]) => void};
}) {
  return createApiClient({
    config: {
      baseUrl: 'https://api.example.com',
      timeoutMs: 25,
    },
    onUnauthorized: overrides?.onUnauthorized,
    logger: overrides?.logger,
  });
}

test('createApiClient adds bearer token and serializes JSON bodies', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let capturedUrl = '';
  let capturedInit: RequestInit | undefined;

  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    capturedUrl =
      typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    capturedInit = init;
    return new Response(JSON.stringify({ok: true}), {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    });
  }) as typeof fetch;

  const client = createTestClient();
  const payload = await client.post<{ok: boolean}>(
    '/users/me',
    {enabled: true},
    {token: 'jwt-token'},
  );

  const headers = new Headers(capturedInit?.headers);
  assert.equal(capturedUrl, 'https://api.example.com/users/me');
  assert.equal(capturedInit?.method, 'POST');
  assert.equal(headers.get('Authorization'), 'Bearer jwt-token');
  assert.equal(headers.get('Content-Type'), 'application/json');
  assert.equal(capturedInit?.body, JSON.stringify({enabled: true}));
  assert.deepEqual(payload, {ok: true});
});

test('createApiClient calls onUnauthorized on 401 responses', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let unauthorizedCalls = 0;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({error: 'Сессия истекла'}), {
      status: 401,
      headers: {'Content-Type': 'application/json'},
    })) as typeof fetch;

  const client = createTestClient({
    onUnauthorized: () => {
      unauthorizedCalls += 1;
    },
  });

  await assert.rejects(
    () => client.get('/users/me'),
    error => {
      assert.ok(error instanceof ApiUnauthorizedError);
      assert.equal(error.message, 'Сессия истекла');
      assert.equal(error.status, 401);
      return true;
    },
  );

  assert.equal(unauthorizedCalls, 1);
});

test('createApiClient can skip unauthorized handler per request', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  let unauthorizedCalls = 0;
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({error: 'expired'}), {
      status: 403,
      headers: {'Content-Type': 'application/json'},
    })) as typeof fetch;

  const client = createTestClient({
    onUnauthorized: () => {
      unauthorizedCalls += 1;
    },
  });

  await assert.rejects(
    () => client.get('/users/me', {handleUnauthorized: false}),
    ApiUnauthorizedError,
  );
  assert.equal(unauthorizedCalls, 0);
});

test('createApiClient returns plain-text error payloads when backend does not send JSON', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async () =>
    new Response('Bad gateway', {
      status: 502,
      headers: {'Content-Type': 'text/plain'},
    })) as typeof fetch;

  const client = createTestClient();

  await assert.rejects(
    () => client.get('/health'),
    error => {
      assert.ok(error instanceof ApiClientError);
      assert.equal(error.message, 'Bad gateway');
      assert.equal(error.status, 502);
      assert.equal(error.responseBody, 'Bad gateway');
      return true;
    },
  );
});

test('createApiClient throws ApiResponseParseError on invalid JSON success payloads', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = (async () =>
    new Response('not-json', {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    })) as typeof fetch;

  const client = createTestClient();
  await assert.rejects(() => client.get('/broken'), ApiResponseParseError);
});

test('createApiClient aborts requests after timeout', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  globalThis.fetch = ((_: string | URL | Request, init?: RequestInit) =>
    new Promise<Response>((_, reject) => {
      init?.signal?.addEventListener(
        'abort',
        () => {
          const abortError = new Error('aborted');
          abortError.name = 'AbortError';
          reject(abortError);
        },
        {once: true},
      );
    })) as typeof fetch;

  const client = createTestClient();
  await assert.rejects(() => client.get('/slow'), ApiTimeoutError);
});

test('normalizeLoadedUser keeps only valid exercises and progress payloads', () => {
  const user = normalizeLoadedUser(
    {
      name: ' alien17 ',
      exercises: [
        {
          exerciseKey: 'bench',
          testWeight: 100,
          testReps: 5,
          oneRM: 116.7,
          bodyWeight: 82,
          date: '2026-04-08',
        },
        {
          exerciseKey: 'unknown',
          testWeight: 50,
          testReps: 5,
          oneRM: 58,
          date: '2026-04-08',
        },
        {
          exerciseKey: 'deadlift',
          testWeight: 0,
          testReps: 5,
          oneRM: 58,
          date: '2026-04-08',
        },
      ],
      trainingProgress: {
        completedSessions: 6,
      },
    },
    'fallback',
  );

  assert.equal(user.name, 'alien17');
  assert.equal(user.exercises.length, 1);
  assert.deepEqual(user.trainingProgress, {completedSessions: 6});
  assert.deepEqual(user.exercises[0], {
    exerciseKey: 'bench',
    testWeight: 100,
    testReps: 5,
    oneRM: 116.7,
    bodyWeight: 82,
    date: '2026-04-08',
  });
});

test('normalizeLoadedUser preserves split completedWeeks and completedDays', () => {
  const user = normalizeLoadedUser(
    {
      name: 'SplitProgress',
      exercises: [],
      splits: [
        {
          id: 'split-1',
          name: 'Push Pull',
          daysPerWeek: 3,
          varyIntensity: true,
          weightMode: 'progression',
          days: [
            {dayNumber: 1, muscles: ['chest', 'biceps']},
            {dayNumber: 2, muscles: ['legs', 'shoulders']},
            {dayNumber: 3, muscles: ['back', 'triceps']},
          ],
          completedWeeks: [0, 1, 2, 3, 9, 'x', 1],
          completedDays: [
            {week: 0, day: 1},
            {week: 0, day: 1},
            {week: 1, day: 2},
            {week: 99, day: 1},
            {week: 2, day: 4},
          ],
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-04T10:00:00.000Z',
        },
      ],
      activeSplitId: 'split-1',
    },
    'fallback',
  );

  assert.equal(user.splits?.length, 1);
  assert.deepEqual(user.splits?.[0]?.completedWeeks, [0, 1, 2, 3]);
  assert.deepEqual(user.splits?.[0]?.completedDays, [
    {week: 0, day: 1},
    {week: 1, day: 2},
  ]);
  assert.equal(user.activeSplitId, 'split-1');
});

test('normalizeLoadedUser restores split calculation snapshots and active selection', () => {
  const user = normalizeLoadedUser(
    {
      name: 'HistoryUser',
      exercises: [],
      splitCalculations: [
        {
          id: 'calculation-1',
          calculatedAt: '2026-08-05T10:30:00.000Z',
          split: {
            id: 'split-1',
            name: 'История',
            daysPerWeek: 2,
            varyIntensity: true,
            weightMode: 'progression',
            days: [
              {dayNumber: 1, muscles: ['chest', 'biceps']},
              {dayNumber: 2, muscles: ['legs', 'back']},
            ],
            customExercisesByDay: {
              1: ['bench', 'dips'],
              2: ['squat'],
            },
            completedWeeks: [0, 1, 1, 9],
            completedDays: [
              {week: 0, day: 1},
              {week: 0, day: 1},
            ],
            createdAt: '2026-08-05T10:00:00.000Z',
            updatedAt: '2026-08-05T11:00:00.000Z',
          },
          exercises: [
            {
              exerciseKey: 'bench',
              testWeight: 100,
              testReps: 5,
              oneRM: 116.7,
              date: '05.08.2026',
            },
            {exerciseKey: 'unknown', testWeight: 10, testReps: 5, oneRM: 11, date: '05.08.2026'},
          ],
        },
      ],
      activeSplitCalculationId: 'calculation-1',
    },
    'fallback',
  );

  assert.equal(user.splitCalculations?.length, 1);
  assert.equal(user.activeSplitCalculationId, 'calculation-1');
  assert.deepEqual(user.splitCalculations?.[0]?.split.customExercisesByDay, {
    1: ['bench', 'dips'],
    2: ['squat'],
  });
  assert.deepEqual(user.splitCalculations?.[0]?.split.completedWeeks, [0, 1]);
  assert.deepEqual(user.splitCalculations?.[0]?.split.completedDays, [{week: 0, day: 1}]);
  assert.equal(user.splitCalculations?.[0]?.exercises.length, 1);
  assert.equal(user.splitCalculations?.[0]?.exercises[0]?.oneRM, 116.7);
  assert.equal(user.profiles?.[0]?.name, 'Основной');
  assert.equal(user.splitCalculations?.[0]?.split.profileId, user.profiles?.[0]?.id);
});

test('normalizeLoadedUser groups a split without profileId into Основной and keeps profileId', () => {
  const user = normalizeLoadedUser(
    {
      name: 'Profiles',
      exercises: [],
      profiles: [
        {
          id: 'profile-petrov',
          name: 'Петров',
          createdAt: '2026-08-02T10:00:00.000Z',
          updatedAt: '2026-08-02T10:00:00.000Z',
        },
      ],
      activeProfileId: 'profile-petrov',
      splits: [
        {
          id: 'split-old',
          name: 'Старый',
          daysPerWeek: 2,
          varyIntensity: true,
          weightMode: 'progression',
          days: [
            {dayNumber: 1, muscles: ['chest', 'biceps']},
            {dayNumber: 2, muscles: ['legs', 'back']},
          ],
          createdAt: '2026-08-01T10:00:00.000Z',
          updatedAt: '2026-08-01T10:00:00.000Z',
        },
        {
          id: 'split-petrov',
          profileId: 'profile-petrov',
          name: 'Тренажёры',
          daysPerWeek: 2,
          varyIntensity: true,
          weightMode: 'progression',
          days: [
            {dayNumber: 1, muscles: ['chest', 'biceps']},
            {dayNumber: 2, muscles: ['legs', 'back']},
          ],
          createdAt: '2026-08-02T10:00:00.000Z',
          updatedAt: '2026-08-02T10:00:00.000Z',
        },
      ],
    },
    'fallback',
  );

  const main = user.profiles?.find(profile => profile.name === 'Основной');
  assert.ok(main);
  assert.equal(user.splits?.find(split => split.id === 'split-old')?.profileId, main?.id);
  assert.equal(user.splits?.find(split => split.id === 'split-petrov')?.profileId, 'profile-petrov');
  assert.equal(user.profiles?.some(profile => profile.id === 'profile-petrov'), true);
  assert.equal(user.activeProfileId, 'profile-petrov');
  assert.equal(user.splits?.length, 2);
});

test('shared session loadUser does not replace saved data with empty fallback on backend and network failures', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const sessionClient = createSessionApiClient('/api');

  globalThis.fetch = (async () =>
    new Response('broken', {
      status: 500,
      headers: {'Content-Type': 'text/plain'},
    })) as typeof fetch;

  await assert.rejects(
    () => sessionClient.loadUser('Steve', 'token'),
    /Не удалось загрузить данные пользователя|broken/,
  );

  globalThis.fetch = (async () => {
    throw new Error('Network error');
  }) as typeof fetch;

  await assert.rejects(() => sessionClient.loadUser('Steve', 'token'), /Network error/);
});

test('shared session loadUser returns null when auth is expired', async t => {
  const originalFetch = globalThis.fetch;
  t.after(() => {
    globalThis.fetch = originalFetch;
  });

  const sessionClient = createSessionApiClient('/api');

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({error: 'expired'}), {
      status: 401,
      headers: {'Content-Type': 'application/json'},
    })) as typeof fetch;

  assert.equal(await sessionClient.loadUser('Steve', 'token'), null);

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({error: 'forbidden'}), {
      status: 403,
      headers: {'Content-Type': 'application/json'},
    })) as typeof fetch;

  assert.equal(await sessionClient.loadUser('Steve', 'token'), null);
});
