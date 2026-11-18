import {useCallback, useEffect, useRef, useState} from 'react';

export interface Phase {
  label: string;
  durationSec: number;
}

export interface PhaseTimerState {
  running: boolean;
  phaseIndex: number;
  phaseElapsedMs: number;
  phaseDurationMs: number;
  totalElapsedMs: number;
  done: boolean;
}

export interface UsePhaseTimerResult extends PhaseTimerState {
  start: () => void;
  stop: () => void;
  toggle: () => void;
  reset: () => void;
  beep: () => void;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    return new (window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext)();
  } catch {
    return null;
  }
}

function beepSound(muted: boolean) {
  if (muted) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // ignore
  }
}

export function usePhaseTimer(phases: Phase[], muted = false): UsePhaseTimerResult {
  const [running, setRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseElapsedMs, setPhaseElapsedMs] = useState(0);
  const [totalElapsedMs, setTotalElapsedMs] = useState(0);
  const [done, setDone] = useState(false);

  const phaseIndexRef = useRef(0);
  const phaseStartRef = useRef<number | null>(null);
  const totalRef = useRef(0);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  const currentPhase = phases[phaseIndex];
  const phaseDurationMs = currentPhase ? currentPhase.durationSec * 1000 : 0;

  const acquireWakeLock = useCallback(async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      wakeLockRef.current = await (navigator as Navigator & {wakeLock: {request: (t: string) => Promise<WakeLockSentinel>}}).wakeLock.request('screen');
    } catch {
      // ignore
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try { await wakeLockRef.current?.release(); } catch { /* ignore */ }
    wakeLockRef.current = null;
  }, []);

  const advance = useCallback(() => {
    const next = phaseIndexRef.current + 1;
    if (next >= phases.length) {
      setDone(true);
      setRunning(false);
      phaseStartRef.current = null;
        void releaseWakeLock();
      beepSound(muted);
      return;
    }
    phaseIndexRef.current = next;
    const now = Date.now();
    phaseStartRef.current = now;
    setPhaseIndex(next);
    setPhaseElapsedMs(0);
    beepSound(muted);
  }, [phases.length, muted, releaseWakeLock]);

  const start = useCallback(() => {
    if (phases.length === 0) return;
    const now = Date.now();
    phaseIndexRef.current = 0;
    phaseStartRef.current = now;
    totalRef.current = 0;
    setPhaseIndex(0);
    setPhaseElapsedMs(0);
    setTotalElapsedMs(0);
    setDone(false);
    setRunning(true);
    void acquireWakeLock();
  }, [phases.length, acquireWakeLock]);

  const resume = useCallback(() => {
    if (phases.length === 0 || done) {
      start();
      return;
    }
    if (phaseStartRef.current === null && phaseElapsedMs > 0) {
      phaseStartRef.current = Date.now() - phaseElapsedMs;
    } else if (phaseStartRef.current === null) {
      phaseStartRef.current = Date.now();
    }
    setRunning(true);
    void acquireWakeLock();
  }, [phases.length, done, phaseElapsedMs, start, acquireWakeLock]);

  const stop = useCallback(() => {
    if (phaseStartRef.current) {
      totalRef.current += Date.now() - phaseStartRef.current;
      setTotalElapsedMs(totalRef.current);
    }
    phaseStartRef.current = null;
    setRunning(false);
    void releaseWakeLock();
  }, [releaseWakeLock]);

  const toggle = useCallback(() => {
    if (running) stop();
    else if (done) start();
    else resume();
  }, [running, done, start, stop, resume]);

  const reset = useCallback(() => {
    phaseIndexRef.current = 0;
    phaseStartRef.current = null;
    totalRef.current = 0;
    setPhaseIndex(0);
    setPhaseElapsedMs(0);
    setTotalElapsedMs(0);
    setDone(false);
    setRunning(false);
    void releaseWakeLock();
  }, [releaseWakeLock]);

  useEffect(() => {
    if (!running || phaseStartRef.current === null) return;
    const interval = window.setInterval(() => {
      if (phaseStartRef.current === null) return;
      const now = Date.now();
      const elapsed = now - phaseStartRef.current;
      const dur = phases[phaseIndexRef.current]?.durationSec ?? 1;
      const durMs = dur * 1000;
      if (elapsed >= durMs) {
        advance();
      } else {
        setPhaseElapsedMs(elapsed);
        setTotalElapsedMs(totalRef.current + elapsed);
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [running, advance, phases]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && running && phaseStartRef.current !== null) {
        const elapsed = Date.now() - phaseStartRef.current;
        const dur = phases[phaseIndexRef.current]?.durationSec ?? 1;
        if (elapsed >= dur * 1000) advance();
        else {
          setPhaseElapsedMs(elapsed);
          setTotalElapsedMs(totalRef.current + elapsed);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [running, advance, phases]);

  return {
    running,
    phaseIndex,
    phaseElapsedMs,
    phaseDurationMs,
    totalElapsedMs,
    done,
    start,
    stop,
    toggle,
    reset,
    beep: () => beepSound(muted),
  };
}