import type {SplitMuscleId} from '../types/index.ts';

export const SPLIT_DAY_LIMITS = {
  /** 4 основных + до 2 дополнительных (этап S1). */
  MAX_EXERCISES_PER_DAY: 6,
  MAX_LEG_EXERCISES: 2,
} as const;

/** All leg exercises available in the program (user picks 2). Deadlift = glutes/hamstrings. */
export const LEG_EXERCISE_KEYS = [
  'deadlift',
  'gluteBridge',
  'squat',
  'legPress',
  'legCurl',
  'legExt',
  'seatedCalfRaise',
] as const;

export type LegExerciseKey = (typeof LEG_EXERCISE_KEYS)[number];

export const DEFAULT_LEG_EXERCISES: [LegExerciseKey, LegExerciseKey] = ['squat', 'legPress'];

/** Program order when a day needs trimming to 4 exercises. */
export const EXERCISES_BY_MUSCLE: Record<SplitMuscleId, readonly string[]> = {
  chest: ['bench', 'dips', 'dbPress'],
  biceps: ['curl'],
  legs: LEG_EXERCISE_KEYS,
  shoulders: ['ohp', 'lateralRaise'],
  back: ['row', 'pullUp'],
  triceps: ['lyingTricepExt'],
};

export function isLegExerciseKey(key: string): key is LegExerciseKey {
  return (LEG_EXERCISE_KEYS as readonly string[]).includes(key);
}

export function normalizeLegExercises(
  input: readonly string[] | undefined,
): [LegExerciseKey, LegExerciseKey] {
  const picked: LegExerciseKey[] = [];
  for (const key of input ?? DEFAULT_LEG_EXERCISES) {
    if (!isLegExerciseKey(key) || picked.includes(key)) continue;
    picked.push(key);
    if (picked.length === 2) break;
  }
  while (picked.length < 2) {
    const fallback = DEFAULT_LEG_EXERCISES.find(key => !picked.includes(key));
    if (!fallback) break;
    picked.push(fallback);
  }
  const first = picked[0] ?? DEFAULT_LEG_EXERCISES[0];
  const second = picked[1] ?? DEFAULT_LEG_EXERCISES[1] ?? first;
  return [first, second];
}

export function splitUsesLegs(days: {muscles: SplitMuscleId[]}[]): boolean {
  return days.some(day => day.muscles.includes('legs'));
}
