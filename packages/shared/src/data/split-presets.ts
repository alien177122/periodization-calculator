import {CATALOG_EXERCISES} from './exercises.ts';
import type {
  CustomSplit,
  SplitDayConfig,
  SplitDayNumber,
  SplitMuscleId,
} from '../types/index.ts';

/**
 * Пресеты сплита (этап S1, docs/split-training-pairing-plan-2026-11-11.md).
 *
 * «Стандартный» — read-only: его нельзя менять, из него делают копию
 * («Сделать своим»). Второй пресет — пример владельца: 2 дня в неделю,
 * 4 основных упражнения + 2 дополнительных.
 */

export interface SplitPresetDay {
  dayNumber: SplitDayNumber;
  name: string;
  /** Основные упражнения дня. */
  main: string[];
  /** Дополнительные упражнения (до двух). */
  extra?: string[];
}

export interface SplitPreset {
  id: string;
  name: string;
  summary: string;
  /** Стандартный пресет выбирается по стандарту и не редактируется напрямую. */
  readOnly: boolean;
  days: SplitPresetDay[];
}

export const STANDARD_SPLIT_PRESET_ID = 'standard';
export const SHORT_SPLIT_PRESET_ID = 'short-4plus2';

export const SPLIT_PRESETS: readonly SplitPreset[] = [
  {
    id: STANDARD_SPLIT_PRESET_ID,
    name: 'Стандартный',
    summary: '12 упражнений на 2 дня: грудь и трицепс против спины и ног.',
    readOnly: true,
    days: [
      {
        dayNumber: 1,
        name: 'Грудь · плечи · трицепс',
        main: ['bench', 'dbPress', 'dips', 'ohp'],
        extra: ['lateralRaise', 'lyingTricepExt'],
      },
      {
        dayNumber: 2,
        name: 'Спина · ноги · бицепс',
        main: ['row', 'pullUp', 'squat', 'deadlift'],
        extra: ['legPress', 'curl'],
      },
    ],
  },
  {
    id: SHORT_SPLIT_PRESET_ID,
    name: 'Короткий 4+2',
    summary: '2 дня в неделю: 4 основных и 2 дополнительных в каждом дне.',
    readOnly: false,
    days: [
      {
        dayNumber: 1,
        name: 'Тяжёлая верхушка · ноги',
        main: ['deadlift', 'dips', 'bench', 'row'],
        extra: ['seatedCalfRaise', 'lateralRaise'],
      },
      {
        dayNumber: 2,
        name: 'Ноги · спина · бицепс',
        main: ['squat', 'legPress', 'pullUp', 'curl'],
        extra: ['legCurl', 'dbPress'],
      },
    ],
  },
];

export function getSplitPreset(id: string): SplitPreset | undefined {
  return SPLIT_PRESETS.find(preset => preset.id === id);
}

/** Упражнения дня в порядке: основные, затем дополнительные. */
export function presetExerciseKeys(day: SplitPresetDay): string[] {
  return [...day.main, ...(day.extra ?? [])].filter(key => Boolean(CATALOG_EXERCISES[key]));
}

/** Мышечные группы дня по каталогу (для SplitDayConfig). */
function musclesForDay(day: SplitPresetDay): SplitMuscleId[] {
  const muscles: SplitMuscleId[] = [];
  for (const key of presetExerciseKeys(day)) {
    const muscle = CATALOG_EXERCISES[key]?.primaryMuscle;
    if (muscle && !muscles.includes(muscle)) muscles.push(muscle);
  }
  return muscles;
}

export interface CreateSplitFromPresetOptions {
  id?: string;
  name?: string;
  now?: string;
}

/** Готовый сплит из пресета. Стандартный пресет клонируется этой же функцией. */
export function createSplitFromPreset(
  preset: SplitPreset,
  options: CreateSplitFromPresetOptions = {},
): CustomSplit {
  const now = options.now ?? new Date().toISOString();
  const days: SplitDayConfig[] = preset.days.map(day => ({
    dayNumber: day.dayNumber,
    muscles: musclesForDay(day),
    label: day.name,
  }));

  const customExercisesByDay: Partial<Record<SplitDayNumber, string[]>> = {};
  for (const day of preset.days) {
    const keys = presetExerciseKeys(day);
    if (keys.length > 0) customExercisesByDay[day.dayNumber] = keys;
  }

  return {
    id: options.id ?? crypto.randomUUID(),
    name: options.name ?? preset.name,
    daysPerWeek: preset.days.length as CustomSplit['daysPerWeek'],
    days,
    varyIntensity: true,
    weightMode: 'progression',
    createdAt: now,
    updatedAt: now,
    customExercisesByDay,
    sourcePresetId: preset.id,
  };
}
