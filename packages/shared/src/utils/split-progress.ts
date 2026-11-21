import type {CustomSplit, SplitDayNumber} from '../types/index.ts';
import {splitDayNumbers} from './split-weight-readiness.ts';

export type {SplitDayNumber};

export type WeekProgressVisual = 'empty' | 'partial' | 'done';

function dayNumbersForSplit(split: CustomSplit): SplitDayNumber[] {
  return splitDayNumbers(split);
}

function uniqueSortedWeeks(weeks: number[]): number[] {
  return [...new Set(weeks.filter(week => Number.isInteger(week) && week >= 0 && week <= 7))].sort(
    (a, b) => a - b,
  );
}

function uniqueSortedDays(
  days: Array<{week: number; day: SplitDayNumber}>,
): Array<{week: number; day: SplitDayNumber}> {
  const seen = new Set<string>();
  const next: Array<{week: number; day: SplitDayNumber}> = [];
  for (const entry of days) {
    if (!Number.isInteger(entry.week) || entry.week < 0 || entry.week > 7) continue;
    if (entry.day !== 1 && entry.day !== 2 && entry.day !== 3 && entry.day !== 4) continue;
    const key = `${entry.week}:${entry.day}`;
    if (seen.has(key)) continue;
    seen.add(key);
    next.push({week: entry.week, day: entry.day});
  }
  return next.sort((a, b) => a.week - b.week || a.day - b.day);
}

/** How many progression days are marked done for a given week. */
export function countCompletedDaysInWeek(split: CustomSplit, weekIndex: number): number {
  const allowed = new Set(dayNumbersForSplit(split));
  return (split.completedDays ?? []).filter(
    entry => entry.week === weekIndex && allowed.has(entry.day),
  ).length;
}

export function isWeekFullyMarkedByDays(split: CustomSplit, weekIndex: number): boolean {
  return countCompletedDaysInWeek(split, weekIndex) >= dayNumbersForSplit(split).length;
}

/** Week is done if explicitly marked or every day of that week is marked. */
export function isWeekEffectivelyDone(split: CustomSplit, weekIndex: number): boolean {
  return (
    (split.completedWeeks ?? []).includes(weekIndex) || isWeekFullyMarkedByDays(split, weekIndex)
  );
}

export function getWeekProgressVisual(split: CustomSplit, weekIndex: number): WeekProgressVisual {
  if (isWeekEffectivelyDone(split, weekIndex)) return 'done';
  if (countCompletedDaysInWeek(split, weekIndex) > 0) return 'partial';
  return 'empty';
}

/**
 * Keep completedWeeks in sync with day marks for one week:
 * all days done → week done; incomplete days → week not done.
 */
export function syncWeekCompletionFromDays(split: CustomSplit, weekIndex: number): CustomSplit {
  const completedDays = uniqueSortedDays(split.completedDays ?? []);
  const weeks = new Set(split.completedWeeks ?? []);
  if (isWeekFullyMarkedByDays({...split, completedDays}, weekIndex)) {
    weeks.add(weekIndex);
  } else {
    weeks.delete(weekIndex);
  }
  const completedWeeks = uniqueSortedWeeks([...weeks]);
  return {
    ...split,
    completedWeeks: completedWeeks.length > 0 ? completedWeeks : undefined,
    completedDays: completedDays.length > 0 ? completedDays : undefined,
  };
}

/** Toggle one day; auto-mark / clear the week square when all days match. */
export function applyToggleCompletedDay(
  split: CustomSplit,
  weekIndex: number,
  day: SplitDayNumber,
): CustomSplit {
  if (!Number.isInteger(weekIndex) || weekIndex < 0 || weekIndex > 7) return split;
  if (!dayNumbersForSplit(split).includes(day)) return split;

  const existing = uniqueSortedDays(split.completedDays ?? []);
  const has = existing.some(entry => entry.week === weekIndex && entry.day === day);
  const completedDays = has
    ? existing.filter(entry => !(entry.week === weekIndex && entry.day === day))
    : [...existing, {week: weekIndex, day}];

  return syncWeekCompletionFromDays(
    {
      ...split,
      completedDays: completedDays.length > 0 ? completedDays : undefined,
      updatedAt: new Date().toISOString(),
    },
    weekIndex,
  );
}

/**
 * Toggle a whole week. Marking done also marks every day of that week;
 * clearing removes those day marks so squares and day chips stay aligned.
 */
export function applyToggleCompletedWeek(split: CustomSplit, weekIndex: number): CustomSplit {
  if (!Number.isInteger(weekIndex) || weekIndex < 0 || weekIndex > 7) return split;

  const markingDone = !isWeekEffectivelyDone(split, weekIndex);
  const dayNumbers = dayNumbersForSplit(split);
  const withoutWeekDays = uniqueSortedDays(split.completedDays ?? []).filter(
    entry => entry.week !== weekIndex,
  );
  const completedDays = markingDone
    ? [...withoutWeekDays, ...dayNumbers.map(day => ({week: weekIndex, day}))]
    : withoutWeekDays;

  const weeks = new Set(split.completedWeeks ?? []);
  if (markingDone) {
    weeks.add(weekIndex);
  } else {
    weeks.delete(weekIndex);
  }
  const completedWeeks = uniqueSortedWeeks([...weeks]);

  return {
    ...split,
    completedWeeks: completedWeeks.length > 0 ? completedWeeks : undefined,
    completedDays: completedDays.length > 0 ? completedDays : undefined,
    updatedAt: new Date().toISOString(),
  };
}
