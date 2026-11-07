import {CATALOG_EXERCISES} from '../data/exercises.ts';
import type {CustomSplit, SavedExercise, SplitDayNumber} from '../types/index.ts';
import {exerciseKeysForDay, migrateToCustomExercises} from './split-constructor.ts';

export function splitDayNumbers(split: CustomSplit): SplitDayNumber[] {
  const count = split.daysPerWeek === 4 ? 4 : split.daysPerWeek === 3 ? 3 : 2;
  return Array.from({length: count}, (_, i) => (i + 1) as SplitDayNumber);
}

export function splitExerciseKeys(split: CustomSplit): string[] {
  const migrated = migrateToCustomExercises(split);
  const keys = new Set<string>();
  for (const day of splitDayNumbers(migrated)) {
    for (const key of exerciseKeysForDay(migrated, day)) {
      keys.add(key);
    }
  }
  return [...keys];
}

export function areCalculationWeightsReady(keys: string[], exercises: SavedExercise[]): boolean {
  if (keys.length === 0) return false;
  const byKey = new Map(exercises.map(entry => [entry.exerciseKey, entry]));
  return keys.every(key => {
    const saved = byKey.get(key);
    if (!saved || !CATALOG_EXERCISES[key]) return false;
    return saved.testWeight > 0 && saved.testReps > 0 && saved.oneRM > 0;
  });
}

export function missingExerciseKeys(keys: string[], exercises: SavedExercise[]): string[] {
  const byKey = new Map(exercises.map(entry => [entry.exerciseKey, entry]));
  return keys.filter(key => {
    const saved = byKey.get(key);
    if (!saved) return true;
    return !(saved.testWeight > 0 && saved.testReps > 0 && saved.oneRM > 0);
  });
}

export function copyExercisesForSplitKeys(
  keys: string[],
  profileExercises: SavedExercise[],
): SavedExercise[] {
  const byKey = new Map(profileExercises.map(entry => [entry.exerciseKey, entry]));
  return keys
    .map(key => byKey.get(key))
    .filter((entry): entry is SavedExercise => Boolean(entry))
    .map(entry => ({...entry}));
}
