import {calc1RMFromCore, scheduleTrainingCoreInit} from '@training/core';
import type {ExerciseConfig, WarmupSet} from '../types/index.ts';

export type OneRMMethod = 'epley' | 'brzycki';

scheduleTrainingCoreInit();

export function roundOneRm(value: number): number {
  return Math.round(value * 10) / 10;
}

/** Pure TS 1RM. Wasm core calls this path's twin; `calc1RM` may prefer wasm. */
export function calc1RMTs(weight: number, reps: number, method: OneRMMethod = 'epley'): number {
  if (weight <= 0 || reps < 1) return 0;
  if (method === 'brzycki') {
    return (100 * weight) / (101.3 - 2.67123 * reps);
  }
  if (reps < 5) return weight / (1.0278 - 0.0278 * reps * 1.3);
  if (reps <= 8) return weight / (1.0278 - 0.0278 * reps * 1.2);
  return weight * (1 + 0.0333 * reps * 1.1);
}

/** Legacy Epley-style estimate (default). Brzycki: (100×W)/(101.3−2.67123×R). */
export function calc1RM(weight: number, reps: number, method: OneRMMethod = 'epley'): number {
  return calc1RMFromCore(weight, reps, method) ?? calc1RMTs(weight, reps, method);
}

export function ceilToStep(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.ceil(value / step) * step;
}

export function roundWeight(value: number, step: number, type: 'A' | 'B' | 'C' | 'D'): number {
  if (type === 'C') return Math.floor(value / step) * step;
  return Math.ceil(value / step) * step;
}

export function calcWorkingWeight(oneRM: number, pct: number, cfg: ExerciseConfig): number {
  return roundWeight(oneRM * (pct / 100), cfg.step, cfg.type);
}

export function volumeClass(t: number): string {
  if (t >= 28) return 'v-hi';
  if (t <= 16) return 'v-lo';
  return 'v-md';
}

export function barColor(t: number): string {
  if (t >= 28) return '#ffb020';
  if (t <= 16) return '#ff4d4d';
  return '#ffc94d';
}

type WarmupTemplate = {pct: number; reps: number; rest: string; purpose: string};

const WARMUP_TEMPLATES: Record<'A' | 'B' | 'C' | 'D', WarmupTemplate[]> = {
  A: [
    {pct: 0.27, reps: 10, rest: '1–2 мин', purpose: 'паттерн движения, активация'},
    {pct: 0.44, reps: 8, rest: '2–3 мин', purpose: 'разгрев'},
    {pct: 0.67, reps: 5, rest: '2–3 мин', purpose: 'подготовка к рабочим весам'},
    {pct: 0.83, reps: 3, rest: '3–4 мин', purpose: 'активация ЦНС (~83%)'},
  ],
  B: [
    {pct: 0.37, reps: 10, rest: '1–2 мин', purpose: 'паттерн движения, активация'},
    {pct: 0.62, reps: 6, rest: '2–3 мин', purpose: 'разгрев'},
    {pct: 0.83, reps: 3, rest: '2–3 мин', purpose: 'активация ЦНС (~83%)'},
  ],
  C: [
    {pct: 0.55, reps: 10, rest: '1–2 мин', purpose: 'разгрев, активация'},
    {pct: 0.8, reps: 6, rest: '2 мин', purpose: 'подготовка к рабочим весам'},
  ],
  D: [
    {pct: 0.5, reps: 12, rest: '1–2 мин', purpose: 'разгрев, техника'},
    {pct: 0.75, reps: 6, rest: '2 мин', purpose: 'подготовка к рабочим весам'},
  ],
};

export function calcWarmupSets(workingWeight: number, cfg: ExerciseConfig): WarmupSet[] {
  if (cfg.usesBodyWeight || cfg.isPullup) return [];
  if (!Number.isFinite(workingWeight) || workingWeight <= 0) return [];
  const step = cfg.warmupStep > 0 ? cfg.warmupStep : cfg.step > 0 ? cfg.step : 0;
  if (!(step > 0)) return [];
  const templates = WARMUP_TEMPLATES[cfg.type];
  return templates.map((t, i) => ({
    label: `Разм ${i + 1}`,
    weight: Math.floor((workingWeight * t.pct) / step) * step,
    reps: t.reps,
    rest: t.rest,
    purpose: t.purpose,
  }));
}
