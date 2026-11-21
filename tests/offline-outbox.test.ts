import test from 'node:test';
import assert from 'node:assert/strict';
import type {UserData} from '@training/shared/types';
import {
  clearOutbox,
  clearOutboxIfNotNewer,
  connectionStatusLabel,
  isRetryableNetworkError,
  outboxKey,
  readDeviceSnapshot,
  readOutbox,
  writeOutbox,
  type OutboxStorage,
} from '@training/shared/utils/offlineOutbox';

const alice: UserData = {name: 'Alice', exercises: [], activeSplitId: 'outbox'};
const bob: UserData = {name: 'Bob', exercises: []};

function memoryStorage(): OutboxStorage {
  const items = new Map<string, string>();
  return {
    getItem(key) {
      return items.get(key) ?? null;
    },
    setItem(key, value) {
      items.set(key, value);
    },
    removeItem(key) {
      items.delete(key);
    },
  };
}

test('isRetryableNetworkError accepts fetch and offline failures only', () => {
  assert.equal(isRetryableNetworkError('Failed to fetch'), true);
  assert.equal(isRetryableNetworkError(new TypeError('Load failed')), true);
  assert.equal(isRetryableNetworkError('Network error'), true);
  assert.equal(isRetryableNetworkError('The device is offline'), true);
  assert.equal(isRetryableNetworkError('A network change interrupted the request'), true);
  assert.equal(isRetryableNetworkError('HTTP 500'), false);
  assert.equal(isRetryableNetworkError('HTTP 404'), false);
  assert.equal(isRetryableNetworkError('Неверный пароль'), false);
  assert.equal(isRetryableNetworkError(''), false);
});

test('connectionStatusLabel uses the four quiet states', () => {
  assert.equal(connectionStatusLabel('online', false), 'Сервер на связи');
  assert.equal(connectionStatusLabel('offline', false), 'Нет связи с сервером');
  assert.equal(connectionStatusLabel('offline', true), 'Нет связи · правки на устройстве');
  assert.equal(connectionStatusLabel('syncing', true), 'Отправляем правки на сервер');
  assert.equal(connectionStatusLabel('online', true), 'Сервер на связи');
});

test('outbox stores one snapshot per user and ignores another user', () => {
  const storage = memoryStorage();
  writeOutbox(storage, {
    data: alice,
    token: 'alice-token',
    updatedAt: '2026-10-10T00:00:00.000Z',
  });
  writeOutbox(storage, {
    data: bob,
    token: 'bob-token',
    updatedAt: '2026-10-10T00:00:01.000Z',
  });

  assert.equal(readOutbox(storage, 'Alice')?.token, 'alice-token');
  assert.equal(readOutbox(storage, 'Bob')?.data.name, 'Bob');
  assert.equal(readOutbox(storage, 'Carol'), null);

  storage.setItem(
    outboxKey('Alice'),
    JSON.stringify({
      data: bob,
      token: 'stolen',
      updatedAt: '2026-10-10T00:00:02.000Z',
    }),
  );
  assert.equal(readOutbox(storage, 'Alice'), null);
  assert.equal(readOutbox(storage, 'Bob')?.token, 'bob-token');
});

test('device snapshot prefers this user outbox over the cache', () => {
  const storage = memoryStorage();
  storage.setItem(
    'gym_user_data_Alice',
    JSON.stringify({name: 'Alice', exercises: [], activeSplitId: 'cache'}),
  );
  storage.setItem('gym_user_data_Bob', JSON.stringify(bob));
  writeOutbox(storage, {
    data: alice,
    token: 'alice-token',
    updatedAt: '2026-10-10T00:00:00.000Z',
  });

  assert.equal(readDeviceSnapshot(storage, 'Alice')?.activeSplitId, 'outbox');
  assert.equal(readDeviceSnapshot(storage, 'Bob')?.name, 'Bob');
  assert.equal(readDeviceSnapshot(storage, 'Carol'), null);

  storage.setItem('gym_user_data_Alice', JSON.stringify(bob));
  clearOutbox(storage, 'Alice');
  assert.equal(readDeviceSnapshot(storage, 'Alice'), null);
});

test('clearOutboxIfNotNewer keeps a snapshot queued during the request', () => {
  const storage = memoryStorage();
  writeOutbox(storage, {
    data: alice,
    token: 'alice-token',
    updatedAt: '2026-10-10T00:00:02.000Z',
  });

  clearOutboxIfNotNewer(storage, 'Alice', '2026-10-10T00:00:01.000Z');
  assert.equal(readOutbox(storage, 'Alice')?.updatedAt, '2026-10-10T00:00:02.000Z');

  clearOutboxIfNotNewer(storage, 'Alice', '2026-10-10T00:00:03.000Z');
  assert.equal(readOutbox(storage, 'Alice'), null);
  assert.ok(readOutbox(storage, 'Bob') === null);
});
