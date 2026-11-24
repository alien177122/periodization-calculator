import {EXERCISES, TRAINING_DAYS} from '../data/exercises.ts';
import type {
  ProgressionMode,
  ProgramSettings,
  PyramidType,
  SavedExercise,
  TrainingPreferences,
  WeekScheme,
  WorkingSetPrescription,
} from '../types/index.ts';
import {calcWorkingWeight} from './calc.ts';
import {
  applyProgressionPresetToPercent,
  applyProgressionPresetToScheme,
} from '../program/progressionPresets.ts';
import {resolveProgramSettings} from '../program/resolveProgramSettings.ts';
import {buildLinearWorkingSets, buildPyramid} from './pyramid.ts';

export const DEFAULT_TRAINING_PREFERENCES: TrainingPreferences = {
  progressionMode: 'linear',
  pyramidType: 'descending',
  rpeBase: 8,
};

export interface TrainingExerciseRow {
  key: string;
  name: string;
  weight: number;
  scheme: WeekScheme;
  totalReps: number;
  exerciseType: 'A' | 'B' | 'C' | 'D';
  warmupStep: number;
  isPullup?: boolean;
  usesBodyWeight?: boolean;
  extraWeight?: number;
  progressionMode: ProgressionMode;
  pyramidType?: PyramidType;
  /** Рабочий % от 1ПМ для этой недели (для тона интенсивности и гейта cluster). */
  intensityPct?: number;
  workingSets: WorkingSetPrescription[];
  warmupTopWeight: number;
  /** v3: «12ПМ», «Тест» или подсказка при missing_test */
  loadHint?: string;
  prescriptionStatus?: string;
}

export function getTrainingExercises(
  dayIdx: number,
  weekIdx: number,
  savedExercises: SavedExercise[],
  preferences: TrainingPreferences = DEFAULT_TRAINING_PREFERENCES,
  programSettings?: ProgramSettings,
): TrainingExerciseRow[] {
  const settings = programSettings ?? resolveProgramSettings(null, '2.0');
  const days = TRAINING_DAYS.slice(0, settings.daysPerWeek);
  const day = days[dayIdx];
  if (!day) return [];

  const savedByKey = new Map(savedExercises.map(saved => [saved.exerciseKey, saved]));

  return day.exerciseKeys.flatMap(key => {
    const config = EXERCISES[key];
    const saved = savedByKey.get(key);
    if (!config || !saved) return [];

    const basePercent = config.percentages[weekIdx];
    const baseScheme = config.weekSchemes[weekIdx];
    if (typeof basePercent !== 'number' || !baseScheme) return [];

    const percentage = applyProgressionPresetToPercent(basePercent, settings.progressionPreset);
    const scheme = applyProgressionPresetToScheme(
      baseScheme.sets,
      baseScheme.reps,
      settings.progressionPreset,
    );

    const totalWeight = calcWorkingWeight(saved.oneRM, percentage, config);
    const isPullup = !!config.isPullup;
    const usesBodyWeight = !!config.usesBodyWeight;
    const extraWeight =
      usesBodyWeight && saved.bodyWeight != null ? totalWeight - saved.bodyWeight : undefined;

    const {progressionMode, rpeBase} = preferences;
    const pyramidType: PyramidType = 'descending';

    const pyramidPlan =
      progressionMode === 'pyramid'
        ? buildPyramid(
            {
              targetWeight: totalWeight,
              targetSets: scheme.sets,
              targetReps: scheme.reps,
              type: pyramidType,
              rpeBase,
            },
            config,
          )
        : null;

    const workingSets = pyramidPlan
      ? pyramidPlan.workingSets
      : buildLinearWorkingSets(totalWeight, scheme.sets, scheme.reps);

    const totalReps = workingSets.reduce((sum, set) => sum + set.reps, 0);
    const displayWeight =
      progressionMode === 'pyramid' ? pyramidPlan!.topWorkingWeight : totalWeight;

    return [
      {
        key,
        name: config.name,
        weight: displayWeight,
        scheme,
        totalReps,
        exerciseType: config.type,
        warmupStep: config.warmupStep,
        isPullup,
        usesBodyWeight,
        extraWeight,
        progressionMode,
        pyramidType: progressionMode === 'pyramid' ? pyramidType : undefined,
        intensityPct: percentage,
        workingSets,
        warmupTopWeight: pyramidPlan?.topWorkingWeight ?? totalWeight,
      },
    ];
  });
}
