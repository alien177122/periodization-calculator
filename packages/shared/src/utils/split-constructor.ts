import {CATALOG_EXERCISES, TRAINING_DAYS} from '../data/exercises.ts';
import {
  DEFAULT_LEG_EXERCISES,
  EXERCISES_BY_MUSCLE,
  SPLIT_DAY_LIMITS,
  normalizeLegExercises,
} from '../data/split-exercises.ts';
import {emptyBaseline} from '../data/split-muscles.ts';
import {MUSCLE_CONTRIB} from '../data/muscles.ts';
import type {
  CustomSplit,
  SavedExercise,
  SplitDayConfig,
  SplitDayNumber,
  SplitMuscleId,
  WeekScheme,
} from '../types/index.ts';
import {calcWorkingWeight} from './calc.ts';
import {buildLinearWorkingSets} from './pyramid.ts';
import type {TrainingExerciseRow} from './training.ts';

const TRICEPS_CONTRIB_KEYS = ['bench', 'dbPress', 'ohp'] as const;

export function distributeSets(total: number, days: number, minPerDay = 2): number[] {
  if (days <= 0) return [];
  if (days === 1) return [Math.max(1, Math.round(total))];

  const roundedTotal = Math.max(0, Math.round(total));
  const minTotal = days * minPerDay;

  if (roundedTotal < minTotal) {
    const result = Array<number>(days).fill(minPerDay);
    let excess = result.reduce((sum, value) => sum + value, 0) - roundedTotal;
    for (let i = result.length - 1; excess > 0 && i >= 0; i -= 1) {
      const current = result[i] ?? minPerDay;
      const reduceBy = Math.min(excess, current - 1);
      result[i] = current - reduceBy;
      excess -= reduceBy;
    }
    return result;
  }

  const result = Array<number>(days).fill(minPerDay);
  let remainder = roundedTotal - minTotal;
  let index = 0;
  while (remainder > 0) {
    result[index] = (result[index] ?? minPerDay) + 1;
    remainder -= 1;
    index = (index + 1) % days;
  }
  return result;
}

export function getBaselineSetsPerMuscle(weekIndex: number): Record<SplitMuscleId, number> {
  const baseline = emptyBaseline();

  for (const day of TRAINING_DAYS) {
    for (const exerciseKey of day.exerciseKeys) {
      const config = CATALOG_EXERCISES[exerciseKey];
      if (!config) continue;
      const scheme = config.weekSchemes[weekIndex];
      if (!scheme) continue;
      baseline[config.primaryMuscle] += scheme.sets;
    }
  }

  for (const exerciseKey of TRICEPS_CONTRIB_KEYS) {
    const config = CATALOG_EXERCISES[exerciseKey];
    const contrib = MUSCLE_CONTRIB[exerciseKey]?.triceps;
    if (!config || !contrib) continue;

    const appearsInProgram = TRAINING_DAYS.some(day => day.exerciseKeys.includes(exerciseKey));
    if (!appearsInProgram) continue;

    const scheme = config.weekSchemes[weekIndex];
    if (!scheme) continue;
    baseline.triceps += scheme.sets * contrib;
  }

  for (const muscle of Object.keys(baseline) as SplitMuscleId[]) {
    baseline[muscle] = Math.round(baseline[muscle]);
  }

  return baseline;
}

function daysForMuscle(split: CustomSplit, muscle: SplitMuscleId): SplitDayConfig[] {
  return split.days
    .filter(day => day.muscles.includes(muscle))
    .sort((a, b) => a.dayNumber - b.dayNumber);
}

export interface BuildPreviewParams {
  split: CustomSplit;
  dayNumber: SplitDayNumber;
  weekIndex: number;
  savedExercises: SavedExercise[];
}

function excludedKeysForDay(split: CustomSplit, dayNumber: SplitDayNumber): Set<string> {
  return new Set(split.excludedExercisesByDay?.[dayNumber] ?? []);
}

export function exerciseKeysForDay(split: CustomSplit, dayNumber: SplitDayNumber): string[] {
  if (split.customExercisesByDay) {
    return (split.customExercisesByDay[dayNumber] ?? []).filter(key =>
      Boolean(CATALOG_EXERCISES[key]),
    );
  }

  const day = split.days.find(entry => entry.dayNumber === dayNumber);
  if (!day) return [];

  const excluded = excludedKeysForDay(split, dayNumber);
  const legKeys = new Set<string>(normalizeLegExercises(split.legExercises));
  const keys: string[] = [];

  for (const muscle of day.muscles) {
    if (keys.length >= SPLIT_DAY_LIMITS.MAX_EXERCISES_PER_DAY) break;

    const pool = muscle === 'legs' ? [...legKeys] : EXERCISES_BY_MUSCLE[muscle];

    for (const exerciseKey of pool) {
      if (keys.length >= SPLIT_DAY_LIMITS.MAX_EXERCISES_PER_DAY) break;
      if (!CATALOG_EXERCISES[exerciseKey]) continue;
      if (excluded.has(exerciseKey)) continue;
      if (keys.includes(exerciseKey)) continue;
      keys.push(exerciseKey);
    }
  }

  for (const [exerciseKey, overrideDay] of Object.entries(split.exerciseDayOverrides ?? {})) {
    if (overrideDay !== dayNumber || !CATALOG_EXERCISES[exerciseKey]) continue;
    if (excluded.has(exerciseKey)) continue;
    if (keys.includes(exerciseKey)) continue;
    const config = CATALOG_EXERCISES[exerciseKey];
    if (config.primaryMuscle === 'legs' && !legKeys.has(exerciseKey)) continue;
    if (keys.length >= SPLIT_DAY_LIMITS.MAX_EXERCISES_PER_DAY) {
      keys.pop();
    }
    keys.push(exerciseKey);
  }

  return keys.slice(0, SPLIT_DAY_LIMITS.MAX_EXERCISES_PER_DAY);
}

/** Exercise keys removed from a day but available for restore in the constructor UI. (Deprecated) */
export function excludedExerciseKeysForDay(
  split: CustomSplit,
  dayNumber: SplitDayNumber,
): string[] {
  return (split.excludedExercisesByDay?.[dayNumber] ?? []).filter(key => CATALOG_EXERCISES[key]);
}

/** Migrates a legacy muscle-based split to the explicit customExercisesByDay structure. */
export function migrateToCustomExercises(split: CustomSplit): CustomSplit {
  if (split.customExercisesByDay) return split;

  const migrated: Partial<Record<SplitDayNumber, string[]>> = {};
  for (const day of split.days) {
    migrated[day.dayNumber] = exerciseKeysForDay(split, day.dayNumber);
  }

  return {
    ...split,
    customExercisesByDay: migrated,
    legExercises: undefined,
    excludedExercisesByDay: undefined,
    exerciseDayOverrides: undefined,
  };
}

export function buildDayPreview(params: BuildPreviewParams): TrainingExerciseRow[] {
  const {split, dayNumber, weekIndex, savedExercises} = params;
  const day = split.days.find(entry => entry.dayNumber === dayNumber);
  if (!day) return [];

  const savedByKey = new Map(savedExercises.map(saved => [saved.exerciseKey, saved]));
  const allowedKeys = exerciseKeysForDay(split, dayNumber);
  const rows: TrainingExerciseRow[] = [];

  for (const exerciseKey of allowedKeys) {
    const config = CATALOG_EXERCISES[exerciseKey];
    if (!config) continue;

    const overrideDay = split.exerciseDayOverrides?.[exerciseKey];
    const muscle = config.primaryMuscle;
    const muscleDays = daysForMuscle(split, muscle);

    let targetDays = muscleDays;
    if (overrideDay) {
      const overrideConfig = split.days.find(entry => entry.dayNumber === overrideDay);
      targetDays = overrideConfig ? [overrideConfig] : [];
    }

    // Bypass legacy muscle group checks if the split uses explicit custom exercises
    if (!split.customExercisesByDay) {
      if (!targetDays.some(entry => entry.dayNumber === dayNumber)) continue;
      if (!day.muscles.includes(muscle) && !overrideDay) continue;
    }

    const schemeBase = config.weekSchemes[weekIndex];
    if (!schemeBase) continue;

    const weeklySets = schemeBase.sets;
    const sets = weeklySets;
    if (sets <= 0) continue;

    const scheme: WeekScheme = {sets, reps: schemeBase.reps};
    const percentage = config.percentages[weekIndex];
    const saved = savedByKey.get(exerciseKey);

    let weight = 0;
    let extraWeight: number | undefined;

    if (split.weightMode === 'scheme_only') {
      weight = 0;
    } else if (split.weightMode === 'fixed') {
      const fixed = split.fixedWeights?.[exerciseKey]?.[weekIndex];
      weight = typeof fixed === 'number' && fixed > 0 ? fixed : 0;
    } else if (saved && typeof percentage === 'number') {
      const totalWeight = calcWorkingWeight(saved.oneRM, percentage, config);
      weight = totalWeight;
      if (config.usesBodyWeight && saved.bodyWeight != null) {
        extraWeight = totalWeight - saved.bodyWeight;
      }
    }

    const workingSets = buildLinearWorkingSets(weight, scheme.sets, scheme.reps);

    rows.push({
      key: exerciseKey,
      name: config.name,
      weight,
      scheme,
      totalReps: workingSets.reduce((sum, set) => sum + set.reps, 0),
      exerciseType: config.type,
      warmupStep: config.warmupStep,
      isPullup: config.isPullup,
      usesBodyWeight: config.usesBodyWeight,
      extraWeight,
      progressionMode: 'linear',
      workingSets,
      warmupTopWeight: weight,
    });
  }

  return rows.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
}

export function createDefaultSplit(name = 'Мой сплит'): CustomSplit {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    name,
    daysPerWeek: 3,
    varyIntensity: true,
    weightMode: 'progression',
    days: [
      {dayNumber: 1, muscles: ['chest', 'biceps']},
      {dayNumber: 2, muscles: ['legs', 'shoulders']},
      {dayNumber: 3, muscles: ['back', 'triceps']},
    ],
    legExercises: [...DEFAULT_LEG_EXERCISES],
    createdAt: now,
    updatedAt: now,
  };
}

export function mergeToTwoDays(days: SplitDayConfig[]): SplitDayConfig[] {
  const day1 = days.find(day => day.dayNumber === 1);
  const day2 = days.find(day => day.dayNumber === 2);
  const day3 = days.find(day => day.dayNumber === 3);

  const mergedMuscles = [
    ...(day1?.muscles ?? []),
    ...(day2?.muscles ?? []),
    ...(day3?.muscles ?? ['back', 'triceps']),
  ];

  const unique = [...new Set(mergedMuscles)] as SplitMuscleId[];

  return [
    {dayNumber: 1, muscles: day1?.muscles ?? ['chest', 'biceps'], label: day1?.label},
    {
      dayNumber: 2,
      muscles: unique.filter(muscle => !(day1?.muscles ?? []).includes(muscle)),
      label: day2?.label,
    },
  ];
}

export function allMusclesAssigned(split: CustomSplit): boolean {
  const assigned = new Set<SplitMuscleId>();
  for (const day of split.days) {
    if (day.muscles.length === 0) return false;
    for (const muscle of day.muscles) {
      if (assigned.has(muscle)) return false;
      assigned.add(muscle);
    }
  }
  return assigned.size === 6;
}

export function validateSplit(_split: CustomSplit): string | null {
  void _split;
  // All validation bans are disabled per user request
  return null;
}
