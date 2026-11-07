// ============================================================
// TYPES — описывают форму всех данных в приложении
// ============================================================

export * from './auth.ts';
export * from './billing.ts';

export interface WeekScheme {
  sets: number;
  reps: number;
}

export interface WarmupSet {
  label: string;
  weight: number;
  reps: number;
  rest: string;
  purpose: string;
}

export type SplitMuscleId = 'chest' | 'biceps' | 'legs' | 'shoulders' | 'back' | 'triceps';

export type SplitWeightMode = 'progression' | 'fixed' | 'scheme_only';

export interface ExerciseConfig {
  name: string;
  type: 'A' | 'B' | 'C' | 'D';
  step: number;
  warmupStep: number;
  percentages: number[];
  weekSchemes: WeekScheme[];
  primaryMuscle: SplitMuscleId;
  /** Bodyweight lifts are tracked as bodyWeight + extra load. */
  usesBodyWeight?: boolean;
  isPullup?: boolean;
}

export type SplitDayNumber = 1 | 2 | 3 | 4;

export interface SplitDayConfig {
  dayNumber: SplitDayNumber;
  muscles: SplitMuscleId[];
  label?: string;
}

/** Person who owns a set of splits. Splits from one profile stay hidden in another. */
export interface TrainingProfile {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomSplit {
  id: string;
  name: string;
  /** Owner. Missing ids are grouped into the «Основной» profile on load. */
  profileId?: string;
  daysPerWeek: 2 | 3 | 4;
  days: SplitDayConfig[];
  varyIntensity: boolean;
  weightMode: SplitWeightMode;
  /** Exactly two leg exercise keys when legs are used in the split. (Deprecated) */
  legExercises?: [string, string];
  fixedWeights?: Record<string, number[]>;
  /** (Deprecated) */
  exerciseDayOverrides?: Record<string, SplitDayNumber>;
  /** Exercise keys hidden from specific training days. (Deprecated) */
  excludedExercisesByDay?: Partial<Record<SplitDayNumber, string[]>>;
  /** Explicit list of exercise keys for each day. If present, it overrides legacy muscle-based population. */
  customExercisesByDay?: Partial<Record<SplitDayNumber, string[]>>;
  /**
   * 0-based week indices (0–7) the athlete marked as completed in the
   * 8-week progression preview.
   */
  completedWeeks?: number[];
  /**
   * Progression days marked done. `week` is 0–7; `day` is the split day number.
   */
  completedDays?: Array<{week: number; day: SplitDayNumber}>;
  createdAt: string;
  updatedAt: string;
}

export interface SavedExercise {
  exerciseKey: string;
  testWeight: number;
  testReps: number;
  oneRM: number;
  date: string;
  bodyWeight?: number;
}

/**
 * Immutable input snapshot for one calculated split forecast.
 * Completion marks remain mutable so progress survives future visits.
 */
export interface SplitCalculation {
  id: string;
  /** Denormalized for filtering; defaults to split.id on load. */
  splitId?: string;
  calculatedAt: string;
  split: CustomSplit;
  exercises: SavedExercise[];
}

export interface TrainingProgress {
  completedSessions: number;
}

export type ActiveProgram = '2.0' | '3.0';

export type TestWeekNumber = 4 | 8 | 12 | 16;

export interface TestResult {
  exerciseKey: string;
  testWeek: TestWeekNumber;
  weight: number;
  reps: number;
  date: string;
}

/** Single calculator track: optimal wave progression (Program 2.0). */
export type ProgressionPreset = 'general';

export const PROGRAM_DAYS_PER_WEEK = 2 as const;

export interface ProgramSettings {
  progressionPreset: ProgressionPreset;
  daysPerWeek: typeof PROGRAM_DAYS_PER_WEEK;
}

export const DEFAULT_PROGRAM_SETTINGS: ProgramSettings = {
  progressionPreset: 'general',
  daysPerWeek: PROGRAM_DAYS_PER_WEEK,
};

export type ProgressionMode = 'linear' | 'pyramid';

export type PyramidType = 'descending' | 'ascending';

export interface TrainingPreferences {
  progressionMode: ProgressionMode;
  pyramidType: PyramidType;
  /** Target RPE for pyramid working sets (7–9). */
  rpeBase: number;
}

export interface WorkingSetPrescription {
  set: number;
  weight: number;
  reps: number;
}

export interface JournalSet {
  setIndex: number;
  weight: number;
  reps: number;
  rpe?: number;
  note?: string;
  additionalWeight?: number;
}

export interface JournalSession {
  id: string;
  exerciseKey: string;
  date: string;
  sets: JournalSet[];
  sessionNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserData {
  name: string;
  exercises: SavedExercise[];
  trainingProgress?: TrainingProgress;
  trainingProgressByProgram?: Partial<Record<ActiveProgram, TrainingProgress>>;
  trainingPreferences?: TrainingPreferences;
  journal?: JournalSession[];
  splits?: CustomSplit[];
  profiles?: TrainingProfile[];
  activeProfileId?: string | null;
  activeSplitId?: string | null;
  splitCalculations?: SplitCalculation[];
  activeSplitCalculationId?: string | null;
  /** Default strength tests per training profile (key = profile id). */
  exercisesByProfileId?: Record<string, SavedExercise[]>;
  activeProgram?: ActiveProgram;
  testResults?: TestResult[];
  programSettings?: ProgramSettings;
}

export interface TrainingDayDef {
  dayNumber: 1 | 2 | 3 | 4;
  name: string;
  exerciseKeys: string[];
}

export interface MuscleMeta {
  label: string;
  color: string;
  catKey: string;
}

export interface FileWorkspacePaths {
  baseDir: string;
  inboxDir: string;
  analysisDir: string;
}

export interface FileWorkspaceOcrConfig {
  baseUrl: string;
  model: string;
}

export interface FileAnalysis {
  kind: string;
  summary: string;
  preview: string;
  metadata: Record<string, string | number | boolean>;
  suggestedUse: string[];
  generatedAt: string;
  source: {
    name: string;
    relativePath: string;
    sizeBytes: number;
    sizeLabel: string;
    modifiedAt: string;
  };
}

export interface WorkspaceFileEntry {
  name: string;
  relativePath: string;
  extension: string;
  sizeBytes: number;
  sizeLabel: string;
  modifiedAt: string;
  hasAnalysis: boolean;
  analysis: FileAnalysis | null;
}

export interface FileWorkspaceResponse {
  paths: FileWorkspacePaths;
  ocr: FileWorkspaceOcrConfig;
  files: WorkspaceFileEntry[];
}
