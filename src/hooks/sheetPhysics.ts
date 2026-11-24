export type SheetDetent = 'medium' | 'large';

export const SHEET_MEDIUM_MAX_PX = 560;
export const SHEET_MEDIUM_VH = 0.72;
export const SHEET_LARGE_MAX_PX = 860;
export const SHEET_LARGE_VH = 0.92;
export const SHEET_DISMISS_DISTANCE_PX = 88;
export const SHEET_DISMISS_VELOCITY_PX_S = 500;
export const SHEET_HYSTERESIS_PX = 10;
export const SHEET_MOMENTUM_D = 0.998;
export const SHEET_RUBBER_CONSTANT = 0.55;
export const SHEET_ENTER_MS = 400;
export const SHEET_EXIT_MS = 250;
export const SHEET_REDUCED_MOTION_MS = 200;
export const SHEET_ENTER_SPRING = {type: 'spring', bounce: 0, duration: 0.4} as const;
export const SHEET_EXIT_SPRING = {type: 'spring', bounce: 0, duration: 0.25} as const;

export function detentHeight(detent: SheetDetent, viewportHeight: number): number {
  if (detent === 'medium') {
    return Math.min(SHEET_MEDIUM_MAX_PX, SHEET_MEDIUM_VH * viewportHeight);
  }
  return Math.min(SHEET_LARGE_MAX_PX, SHEET_LARGE_VH * viewportHeight);
}

export function rubberBand(overshoot: number, dim: number): number {
  const magnitude = Math.abs(overshoot);
  if (dim <= 0 || magnitude === 0) return 0;
  const resisted =
    (magnitude * dim * SHEET_RUBBER_CONSTANT) / (dim + SHEET_RUBBER_CONSTANT * magnitude);
  return Math.sign(overshoot) * resisted;
}

/** Momentum projection: `current + (v/1000) · d/(1−d)`, `d ≈ 0.998`. */
export function projectPosition(
  current: number,
  velocityY: number,
  damping = SHEET_MOMENTUM_D,
): number {
  const denom = 1 - damping;
  if (denom <= 0) return current;
  return current + (velocityY / 1000) * (damping / denom);
}

export function shouldDismissSheet(dy: number, velocityY: number): boolean {
  return dy > SHEET_DISMISS_DISTANCE_PX || velocityY > SHEET_DISMISS_VELOCITY_PX_S;
}

export function applyRubberY(rawY: number, minY: number, maxY: number, dim: number): number {
  if (rawY < minY) return minY + rubberBand(rawY - minY, dim);
  if (rawY > maxY) return maxY + rubberBand(rawY - maxY, dim);
  return rawY;
}

export function nearestValue(projected: number, candidates: readonly number[]): number {
  let nearest = candidates[0] ?? 0;
  let best = Number.POSITIVE_INFINITY;
  for (const candidate of candidates) {
    const distance = Math.abs(projected - candidate);
    if (distance < best) {
      best = distance;
      nearest = candidate;
    }
  }
  return nearest;
}

export function resolveSheetRelease(options: {
  dy: number;
  velocityY: number;
  currentY: number;
  restYs: readonly number[];
  dismissY: number;
}): 'dismiss' | number {
  if (shouldDismissSheet(options.dy, options.velocityY)) return 'dismiss';
  const projected = projectPosition(options.currentY, options.velocityY);
  return nearestValue(projected, options.restYs);
}

export function sheetMotionMode(reducedMotion: boolean): 'fade' | 'travel' {
  return reducedMotion ? 'fade' : 'travel';
}

export function buildSheetLayout(
  detents: readonly SheetDetent[],
  viewportHeight: number,
): {
  maxHeight: number;
  restYByDetent: Record<SheetDetent, number>;
  restYs: number[];
  dismissY: number;
} {
  const enabled = detents.length > 0 ? detents : (['medium'] as const);
  const restYByDetent = {medium: 0, large: 0};
  const heights = enabled.map(detent => detentHeight(detent, viewportHeight));
  const maxHeight = Math.max(...heights);
  const restYs: number[] = [];
  for (const detent of enabled) {
    const y = maxHeight - detentHeight(detent, viewportHeight);
    restYByDetent[detent] = y;
    restYs.push(y);
  }
  restYs.sort((a, b) => a - b);
  return {maxHeight, restYByDetent, restYs, dismissY: maxHeight};
}

export function detentForRestY(
  restY: number,
  restYByDetent: Record<SheetDetent, number>,
  detents: readonly SheetDetent[],
): SheetDetent {
  for (const detent of detents) {
    if (Math.abs(restYByDetent[detent] - restY) < 0.5) return detent;
  }
  return detents.includes('large') ? 'large' : (detents[0] ?? 'medium');
}
