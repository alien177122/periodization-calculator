import {CATALOG_EXERCISES} from './exercises.ts';
import type {CustomSplit, SplitDayNumber, WeekScheme} from '../types/index.ts';

/**
 * Схемы подходов на уровне дня (этап S1, docs/split-training-pairing-plan-2026-11-11.md).
 *
 * Схема программы живёт в `ExerciseConfig.weekSchemes` и общая для всех дней.
 * Здесь — точечное перекрытие: «в этом дне у этого упражнения 5×4 вместо 4×4».
 * Пустое поле = поведение как сейчас, старые сплиты мигрируют без изменений.
 */

export const DAY_SCHEME_LIMITS = {
  MIN_SETS: 1,
  MAX_SETS: 12,
  MIN_REPS: 1,
  MAX_REPS: 30,
} as const;

/** Валидная схема подходов или null. */
export function normalizeDayScheme(value: unknown): WeekScheme | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as {sets?: unknown; reps?: unknown};
  const sets = raw.sets;
  const reps = raw.reps;
  if (typeof sets !== 'number' || !Number.isInteger(sets)) return null;
  if (typeof reps !== 'number' || !Number.isInteger(reps)) return null;
  if (sets < DAY_SCHEME_LIMITS.MIN_SETS || sets > DAY_SCHEME_LIMITS.MAX_SETS) return null;
  if (reps < DAY_SCHEME_LIMITS.MIN_REPS || reps > DAY_SCHEME_LIMITS.MAX_REPS) return null;
  return {sets, reps};
}

/** Перекрытия схем для дня (пустой объект, если их нет). */
export function daySchemeOverridesFor(
  split: CustomSplit,
  dayNumber: SplitDayNumber,
): Record<string, WeekScheme> {
  return split.schemeOverridesByDay?.[dayNumber] ?? {};
}

/**
 * Схема упражнения в дне: перекрытие дня важнее схемы программы.
 * weekIndex нужен только для fallback на weekSchemes.
 */
export function resolveDayScheme(params: {
  split: CustomSplit;
  dayNumber: SplitDayNumber;
  exerciseKey: string;
  weekIndex: number;
}): WeekScheme | undefined {
  const {split, dayNumber, exerciseKey, weekIndex} = params;
  const override = daySchemeOverridesFor(split, dayNumber)[exerciseKey];
  if (override) return override;
  return CATALOG_EXERCISES[exerciseKey]?.weekSchemes[weekIndex];
}

/** Иммутабельно ставит схему упражнения в дне. */
export function withDayScheme(params: {
  split: CustomSplit;
  dayNumber: SplitDayNumber;
  exerciseKey: string;
  scheme: WeekScheme;
}): CustomSplit {
  const {split, dayNumber, exerciseKey, scheme} = params;
  const normalized = normalizeDayScheme(scheme);
  if (!normalized) return split;

  const dayOverrides = {...daySchemeOverridesFor(split, dayNumber)};
  dayOverrides[exerciseKey] = normalized;

  return {
    ...split,
    schemeOverridesByDay: {
      ...split.schemeOverridesByDay,
      [dayNumber]: dayOverrides,
    },
    updatedAt: new Date().toISOString(),
  };
}

/** Иммутабельно снимает перекрытие (схема снова из программы). */
export function withoutDayScheme(params: {
  split: CustomSplit;
  dayNumber: SplitDayNumber;
  exerciseKey: string;
}): CustomSplit {
  const {split, dayNumber, exerciseKey} = params;
  const dayOverrides = {...daySchemeOverridesFor(split, dayNumber)};
  if (!(exerciseKey in dayOverrides)) return split;
  delete dayOverrides[exerciseKey];

  const schemeOverridesByDay = {...split.schemeOverridesByDay};
  if (Object.keys(dayOverrides).length > 0) {
    schemeOverridesByDay[dayNumber] = dayOverrides;
  } else {
    delete schemeOverridesByDay[dayNumber];
  }

  return {
    ...split,
    schemeOverridesByDay:
      Object.keys(schemeOverridesByDay).length > 0 ? schemeOverridesByDay : undefined,
    updatedAt: new Date().toISOString(),
  };
}

/** Есть ли в сплите хоть одно перекрытие схемы. */
export function hasDaySchemeOverrides(split: CustomSplit): boolean {
  return Object.values(split.schemeOverridesByDay ?? {}).some(
    day => Object.keys(day ?? {}).length > 0,
  );
}

/**
 * Нормализация для сохранения (сервер и клиент читают по-разному,
 * но структура поля одинаковая): битые записи отбрасываются.
 */
export function normalizeDaySchemeOverrides(input: unknown): CustomSplit['schemeOverridesByDay'] {
  if (typeof input !== 'object' || input === null) return undefined;
  const source = input as Record<string, unknown>;
  const result: NonNullable<CustomSplit['schemeOverridesByDay']> = {};

  for (const dayNumber of [1, 2, 3, 4] as const) {
    const raw = source[String(dayNumber)];
    if (typeof raw !== 'object' || raw === null) continue;
    const daySchemes: Record<string, WeekScheme> = {};
    for (const [exerciseKey, value] of Object.entries(raw as Record<string, unknown>)) {
      if (!exerciseKey.trim()) continue;
      const scheme = normalizeDayScheme(value);
      if (!scheme) continue;
      daySchemes[exerciseKey.trim()] = scheme;
    }
    if (Object.keys(daySchemes).length > 0) result[dayNumber] = daySchemes;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}
