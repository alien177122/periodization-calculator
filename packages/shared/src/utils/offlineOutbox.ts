import type {UserData} from '../types/index.ts';

export const OUTBOX_KEY_PREFIX = 'gym_outbox_v1_';
export const OUTBOX_CHANGED_EVENT = 'gym-outbox-changed';

export interface OutboxStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface OutboxSnapshot {
  data: UserData;
  token: string;
  updatedAt: string;
}

export type ConnectionPhase = 'online' | 'offline' | 'syncing';

export function outboxKey(userName: string): string {
  return `${OUTBOX_KEY_PREFIX}${userName}`;
}

export function isRetryableNetworkError(error: unknown): boolean {
  const message =
    typeof error === 'string' ? error : error instanceof Error ? error.message : '';
  const normalized = message.trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized.includes('failed to fetch') ||
    normalized.includes('load failed') ||
    normalized.includes('network error') ||
    normalized.includes('offline') ||
    normalized.includes('network')
  );
}

export function connectionStatusLabel(phase: ConnectionPhase, pending: boolean): string {
  if (phase === 'syncing') return 'Отправляем правки на сервер';
  if (phase === 'offline' && pending) return 'Нет связи · правки на устройстве';
  if (phase === 'offline') return 'Нет связи с сервером';
  return 'Сервер на связи';
}

function isUserData(value: unknown): value is UserData {
  if (!value || typeof value !== 'object') return false;
  const record = value as {name?: unknown; exercises?: unknown};
  return typeof record.name === 'string' && Array.isArray(record.exercises);
}

function notifyOutboxChanged(): void {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(OUTBOX_CHANGED_EVENT));
}

export function readOutbox(storage: OutboxStorage, userName: string): OutboxSnapshot | null {
  if (!userName) return null;
  const raw = storage.getItem(outboxKey(userName));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OutboxSnapshot>;
    if (!isUserData(parsed.data)) return null;
    if (parsed.data.name !== userName) return null;
    if (typeof parsed.token !== 'string' || !parsed.token) return null;
    if (typeof parsed.updatedAt !== 'string' || !parsed.updatedAt) return null;
    return {data: parsed.data, token: parsed.token, updatedAt: parsed.updatedAt};
  } catch {
    return null;
  }
}

export function writeOutbox(storage: OutboxStorage, snapshot: OutboxSnapshot): void {
  const userName = snapshot.data.name;
  if (!userName) return;
  storage.setItem(outboxKey(userName), JSON.stringify(snapshot));
  notifyOutboxChanged();
}

export function clearOutbox(storage: OutboxStorage, userName: string): void {
  if (!userName) return;
  storage.removeItem(outboxKey(userName));
  notifyOutboxChanged();
}

/** Drop a pending snapshot only when nothing newer was queued during the request. */
export function clearOutboxIfNotNewer(
  storage: OutboxStorage,
  userName: string,
  startedAt: string,
): void {
  const current = readOutbox(storage, userName);
  if (!current || current.updatedAt <= startedAt) {
    if (current) clearOutbox(storage, userName);
  }
}

export function readCachedUserData(storage: OutboxStorage, userName: string): UserData | null {
  if (!userName) return null;
  const raw = storage.getItem(`gym_user_data_${userName}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isUserData(parsed) || parsed.name !== userName) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Pending outbox wins over the plain local cache. Another user's keys are ignored. */
export function readDeviceSnapshot(storage: OutboxStorage, userName: string): UserData | null {
  const pending = readOutbox(storage, userName);
  if (pending) return pending.data;
  return readCachedUserData(storage, userName);
}
