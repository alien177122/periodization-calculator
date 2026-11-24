import {useCallback, useEffect, useRef, useState} from 'react';
import {
  OUTBOX_CHANGED_EVENT,
  readOutbox,
  type ConnectionPhase,
} from '@training/shared/utils/offlineOutbox';
import {API, saveUser} from '../utils/api';

const PROBE_MS = 15_000;

function snapshotFor(userName: string) {
  if (!userName || typeof localStorage === 'undefined') return null;
  return readOutbox(localStorage, userName);
}

export function useServerConnection(userName: string) {
  const [phase, setPhase] = useState<ConnectionPhase>(() =>
    snapshotFor(userName) ? 'offline' : 'online',
  );
  const [pending, setPending] = useState(() => snapshotFor(userName) !== null);
  const probeLock = useRef(false);
  const blockedUpdatedAt = useRef<string | null>(null);

  const probe = useCallback(async () => {
    if (probeLock.current) return;
    probeLock.current = true;
    let followUp = false;
    try {
      let online = false;
      try {
        const response = await fetch(`${API}/health`, {cache: 'no-store'});
        online = response.ok;
      } catch {
        online = false;
      }

      const entry = snapshotFor(userName);
      setPending(entry !== null);

      if (!online) {
        setPhase('offline');
        return;
      }

      if (!entry || entry.updatedAt === blockedUpdatedAt.current) {
        setPhase('online');
        return;
      }

      setPhase('syncing');
      const sentAt = entry.updatedAt;
      const result = await saveUser(entry.data, entry.token);
      const still = snapshotFor(userName);

      if (result.pending) {
        setPending(true);
        setPhase('offline');
      } else if (result.ok) {
        blockedUpdatedAt.current = null;
        setPending(still !== null);
        setPhase('online');
        if (still && still.updatedAt !== sentAt) followUp = true;
      } else {
        const error = result.error ?? '';
        if (!error.startsWith('HTTP 5')) {
          blockedUpdatedAt.current = sentAt;
        }
        setPending(still !== null);
        setPhase('online');
      }
    } finally {
      probeLock.current = false;
    }

    if (followUp) void probe();
  }, [userName]);

  useEffect(() => {
    const onOnline = () => {
      void probe();
    };
    const onOffline = () => {
      setPending(snapshotFor(userName) !== null);
      setPhase('offline');
    };
    const onOutbox = () => {
      setPending(snapshotFor(userName) !== null);
      void probe();
    };

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener(OUTBOX_CHANGED_EVENT, onOutbox);
    void probe();
    const id = window.setInterval(() => {
      void probe();
    }, PROBE_MS);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener(OUTBOX_CHANGED_EVENT, onOutbox);
      window.clearInterval(id);
    };
  }, [probe, userName]);

  return {phase, pending};
}
