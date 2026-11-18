/**
 * Интенсивность → тон (Фаза 1 плана training-minimal-plan).
 *
 * Цвета маппятся на существующие токены (не новые HEX):
 *   light  → --color-success / зелёный
 *   medium → --color-warning / оранжевый
 *   peak   → --color-danger  / красный
 * Фон стека/чипа дня — tint-вариант токена.
 */

export type IntensityTone = 'light' | 'medium' | 'peak';

/** Пороги по % от 1ПМ. */
export function intensityTone(pct: number): IntensityTone {
  if (!Number.isFinite(pct)) return 'light';
  if (pct < 70) return 'light';
  if (pct < 80) return 'medium';
  return 'peak';
}

/** cluster разрешён только > 80% */
export function clusterAllowed(pct: number): boolean {
  return Number.isFinite(pct) && pct > 80;
}