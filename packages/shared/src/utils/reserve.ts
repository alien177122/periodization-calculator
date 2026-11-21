/**
 * Сравнение циклов с запасом (Фаза 10 плана training-minimal).
 *
 * RIR = 10 − RPE (RPE 6–10 → RIR 0–4). Новое поле в JournalSet не вводим.
 * adjustedE1rm = w × (1 + (reps + rir) / 30), Epley валиден до 12 эффективных
 * повторов — дальше не считаем (null). Не врём.
 */

import type {JournalSet} from '../types/index.ts';

/** RPE 6–10 → запас 0–4. Вне диапазона — null. */
export function rirFromRpe(rpe?: number): number | null {
  if (rpe == null || !Number.isFinite(rpe)) return null;
  if (rpe < 6 || rpe > 10) return null;
  return Math.round(10 - rpe);
}

/**
 * e1RM с поправкой на запас: эффективные повторы = reps + rir.
 * Epley валиден до ~12 эффективных повторов — дальше не считаем.
 */
export function adjustedE1rm(weight: number, reps: number, rir: number | null): number | null {
  if (!(weight > 0) || !(reps > 0)) return null;
  if (rir == null) return null;
  if (rir < 0 || rir > 4) return null;
  const effective = reps + rir;
  if (effective > 12) return null;
  return Math.round(weight * (1 + effective / 30) * 10) / 10;
}

export interface ReservePoint {
  raw: number;
  adjusted: number | null;
  rir: number | null;
}

/** Пик сессии: сырой всегда, скорректированный — только если у сета есть RPE. */
export function sessionPeakWithReserve(sets: JournalSet[]): ReservePoint | null {
  if (!sets || sets.length === 0) return null;
  let bestRaw = 0;
  let bestAdjusted: number | null = null;
  let bestRir: number | null = null;
  for (const set of sets) {
    const raw = set.weight * (1 + set.reps / 30);
    if (raw > bestRaw) bestRaw = raw;
    const rir = rirFromRpe(set.rpe);
    const adj = adjustedE1rm(set.weight, set.reps, rir);
    if (adj != null && (bestAdjusted == null || adj > bestAdjusted)) {
      bestAdjusted = adj;
      bestRir = rir;
    }
  }
  return {
    raw: Math.round(bestRaw * 10) / 10,
    adjusted: bestAdjusted,
    rir: bestRir,
  };
}