import { useCallback, useEffect, useRef, useState } from 'react';

const MUTE_KEY = 'block-timer-muted';

export interface BlockTimerState {
  running: boolean;
  startedAt: number | null;
  elapsedMs: number;
  totalMs: number;
  muted: boolean;
}

export interface UseBlockTimerResult extends BlockTimerState {
  start: () => void;
  stop: () => void;
  toggle: () => void;
  reset: () => void;
  setMuted: (muted: boolean) => void;
  beep: () => void;
}

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(muted: boolean) {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    // ignore
  }
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

export function beep(frequency = 880, durationMs = 180, muted = false) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch {
    // ignore audio errors
  }
}

export function useBlockTimer(autoStopMs = 10 * 60 * 1000): UseBlockTimerResult {
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [muted, setMutedState] = useState<boolean>(() => readMuted());

  const startedAtRef = useRef<number | null>(null);
  const totalRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    writeMuted(value);
  }, []);

  const acquireWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await (navigator as Navigator & {wakeLock: {request: (type: string) => Promise<WakeLockSentinel>}}).wakeLock.request('screen');
    } catch {
      // ignore
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      await wakeLockRef.current?.release();
    } catch {
      // ignore
    }
    wakeLockRef.current = null;
  }, []);

  const start = useCallback(() => {
    const now = Date.now();
    startedAtRef.current = now;
    setStartedAt(now);
    setElapsedMs(0);
    setRunning(true);
    void acquireWakeLock();
  }, [acquireWakeLock]);

  const stop = useCallback(() => {
    if (startedAtRef.current) {
      totalRef.current += Date.now() - startedAtRef.current;
      setTotalMs(totalRef.current);
    }
    startedAtRef.current = null;
    setStartedAt(null);
    setElapsedMs(0);
    setRunning(false);
    void releaseWakeLock();
  }, [releaseWakeLock]);

  const toggle = useCallback(() => {
    if (running) stop();
    else start();
  }, [running, start, stop]);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    totalRef.current = 0;
    setStartedAt(null);
    setElapsedMs(0);
    setTotalMs(0);
    setRunning(false);
    void releaseWakeLock();
  }, [releaseWakeLock]);

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      if (!startedAtRef.current) return;
      const now = Date.now();
      const elapsed = now - startedAtRef.current;
      setElapsedMs(elapsed);
      if (elapsed >= autoStopMs) {
        beep(660, 240, muted);
        stop();
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [running, autoStopMs, muted, stop]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && running && startedAtRef.current) {
        const elapsed = Date.now() - startedAtRef.current;
        setElapsedMs(elapsed);
        if (elapsed >= autoStopMs) stop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [running, autoStopMs, stop]);

  return {
    running,
    startedAt,
    elapsedMs,
    totalMs,
    muted,
    start,
    stop,
    toggle,
    reset,
    setMuted,
    beep: () => beep(880, 180, muted),
  };
}
