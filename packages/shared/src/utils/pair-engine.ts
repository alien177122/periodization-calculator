import {CATALOG_EXERCISES} from '../data/exercises.ts';
import {MUSCLE_CONTRIB} from '../data/muscles.ts';

/** Мышцы, конкуренция по которым считается конфликтом (основные). */
const PRIMARY_MUSCLES = new Set([
  'chest',
  'quads',
  'glutes',
  'hamstrings',
  'lats',
  'front_delt',
  'mid_delt',
  'rear_delt',
  'lower_back',
]);

/** Дополнительный вклад (ниже в каталоге) для парного движка. */
const EXTRA_CONTRIB: Record<string, Record<string, number>> = {
  deadlift: {lower_back: 0.8, grip: 0.6},
  row: {lower_back: 0.5},
  pullUp: {grip: 0.7},
  bench: {},
  dips: {},
};

export type PairVerdict = 'ok' | 'warning' | 'conflict';

export interface PairAnalysis {
  a: string;
  b: string;
  sharedMuscles: string[];
  primaryConflicts: string[];
  secondaryOverlaps: string[];
  verdict: PairVerdict;
  reason: string;
  timingSec: number;
}

function contrib(key: string): Record<string, number> {
  return {...(MUSCLE_CONTRIB[key] ?? {}), ...(EXTRA_CONTRIB[key] ?? {})};
}

export function muscleOverlap(a: string, b: string): string[] {
  const ca = contrib(a);
  const cb = contrib(b);
  return Object.keys(ca).filter(m => (cb[m] ?? 0) > 0);
}

export function pairVerdict(a: string, b: string): PairVerdict {
  const ca = contrib(a);
  const cb = contrib(b);
  const shared = Object.keys(ca).filter(m => (cb[m] ?? 0) > 0);
  const primary = shared.filter(m => PRIMARY_MUSCLES.has(m));
  if (primary.length > 0) return 'conflict';
  if (shared.length > 0) return 'warning';
  return 'ok';
}

export function pairReason(a: string, b: string): string {
  const v = pairVerdict(a, b);
  if (v === 'ok') return 'Конкуренции по мышцам нет — пара работает.';
  const shared = muscleOverlap(a, b);
  const primary = shared.filter(m => PRIMARY_MUSCLES.has(m));
  if (v === 'conflict') {
    if (primary.includes('lower_back')) return 'Конфликт по пояснице: оба упражнения нагружают нижнюю часть спины.';
    if (primary.includes('chest')) return 'Конфликт: оба упражнения — жимовые на грудь.';
    return `Конфликт по мышцам: ${primary.join(', ')}.`;
  }
  if (shared.includes('grip')) return 'Предупреждение по хвату: оба нагружают предплечья/хват.';
  return `Пересечение по мышцам: ${shared.join(', ')}.`;
}

export function analyzePair(a: string, b: string): PairAnalysis {
  const shared = muscleOverlap(a, b);
  const primaryConflicts = shared.filter(m => PRIMARY_MUSCLES.has(m));
  const secondaryOverlaps = shared.filter(m => !PRIMARY_MUSCLES.has(m));
  const verdict = pairVerdict(a, b);
  // timing: restAfterA 180 + work 40 + restAfterB 150 ≈ 370s → 6-7 мин
  const timingSec = 180 + 40 + 150;
  return {
    a,
    b,
    sharedMuscles: shared,
    primaryConflicts,
    secondaryOverlaps,
    verdict,
    reason: pairReason(a, b),
    timingSec,
  };
}

export function suggestPairPartner(exerciseKey: string, dayKeys: string[]): string | undefined {
  // pick the exercise with least muscle overlap
  let best: string | undefined;
  let bestOverlap = Infinity;
  for (const candidate of dayKeys) {
    if (candidate === exerciseKey) continue;
    const ov = muscleOverlap(exerciseKey, candidate).length;
    if (ov < bestOverlap) {
      bestOverlap = ov;
      best = candidate;
    }
  }
  return best;
}
