export const SPLIT_LIMITS = {
  MAX_SPLITS: 50,
  MAX_CALCULATIONS: 50,
  MAX_NAME_LENGTH: 40,
  MAX_DAY_LABEL_LENGTH: 20,
};

export const LEG_EXERCISE_KEYS = new Set([
  'squat',
  'legPress',
  'legExt',
  'legCurl',
  'gluteBridge',
  'seatedCalfRaise',
]);

const SPLIT_MUSCLES = new Set(['chest', 'biceps', 'legs', 'shoulders', 'back', 'triceps']);
const WEIGHT_MODES = new Set(['progression', 'fixed', 'scheme_only']);

export function pruneSplits(splits) {
  return [...splits]
    .sort((a, b) => String(b.updatedAt ?? '').localeCompare(String(a.updatedAt ?? '')))
    .slice(0, SPLIT_LIMITS.MAX_SPLITS);
}

export function isSplitMuscle(value) {
  return SPLIT_MUSCLES.has(value);
}

export function isWeightMode(value) {
  return WEIGHT_MODES.has(value);
}

export function normalizeLegExercisesArray(input) {
  if (!Array.isArray(input)) return null;
  const picked = [];
  for (const key of input) {
    if (typeof key !== 'string' || !LEG_EXERCISE_KEYS.has(key.trim())) continue;
    const id = key.trim();
    if (picked.includes(id)) continue;
    picked.push(id);
    if (picked.length === 2) break;
  }
  if (picked.length !== 2) return null;
  return picked;
}

const DAY_SCHEME_LIMITS = {MIN_SETS: 1, MAX_SETS: 12, MIN_REPS: 1, MAX_REPS: 30};

const PAIR_LIMITS = {MAX_PAIRS_PER_DAY: 3, MIN_REST_SEC: 30, MAX_REST_SEC: 900};
const DEFAULT_PAIR_REST = {afterA: 180, afterB: 150};

function clampRest(value, fallback) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(PAIR_LIMITS.MAX_REST_SEC, Math.max(PAIR_LIMITS.MIN_REST_SEC, Math.round(value)));
}

/**
 * Связки упражнений дня (S3): {1: [{id, a, b, restAfterA, restAfterB}]}.
 * Одно упражнение — максимум в одной связке дня, битые записи отбрасываются.
 */
export function normalizePairsByDay(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const result = {};
  for (const dayNum of [1, 2, 3, 4]) {
    const rawDay = input[dayNum];
    if (!Array.isArray(rawDay)) continue;
    const pairs = [];
    const used = new Set();
    for (const entry of rawDay) {
      if (pairs.length >= PAIR_LIMITS.MAX_PAIRS_PER_DAY) break;
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
      const a = typeof entry.a === 'string' ? entry.a.trim() : '';
      const b = typeof entry.b === 'string' ? entry.b.trim() : '';
      if (!a || !b || a === b) continue;
      if (used.has(a) || used.has(b)) continue;
      used.add(a);
      used.add(b);
      pairs.push({
        id:
          typeof entry.id === 'string' && entry.id.trim() ? entry.id.trim() : `${a}__${b}`,
        a,
        b,
        restAfterA: clampRest(entry.restAfterA, DEFAULT_PAIR_REST.afterA),
        restAfterB: clampRest(entry.restAfterB, DEFAULT_PAIR_REST.afterB),
      });
    }
    if (pairs.length > 0) result[dayNum] = pairs;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Схемы подходов конкретного дня (S1): {1: {exerciseKey: {sets, reps}}}.
 * Битые записи отбрасываются, пустой результат = undefined (поле не хранится).
 */
export function normalizeSchemeOverridesByDay(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined;
  const result = {};
  for (const dayNum of [1, 2, 3, 4]) {
    const day = input[dayNum];
    if (!day || typeof day !== 'object' || Array.isArray(day)) continue;
    const schemes = {};
    for (const [exerciseKey, scheme] of Object.entries(day)) {
      if (typeof exerciseKey !== 'string' || !exerciseKey.trim()) continue;
      if (!scheme || typeof scheme !== 'object') continue;
      const {sets, reps} = scheme;
      if (!Number.isInteger(sets) || !Number.isInteger(reps)) continue;
      if (sets < DAY_SCHEME_LIMITS.MIN_SETS || sets > DAY_SCHEME_LIMITS.MAX_SETS) continue;
      if (reps < DAY_SCHEME_LIMITS.MIN_REPS || reps > DAY_SCHEME_LIMITS.MAX_REPS) continue;
      schemes[exerciseKey.trim()] = {sets, reps};
    }
    if (Object.keys(schemes).length > 0) result[dayNum] = schemes;
  }
  return Object.keys(result).length > 0 ? result : undefined;
}
