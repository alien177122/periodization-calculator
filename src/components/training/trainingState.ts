import type { TrainingExerciseRow } from '../../utils/training'

export type TrainingState =
  | { kind: 'locked'; missingExercises: string[] }
  | {
      kind: 'active'
      completedSessions: number
      currentDayIdx: number
      currentWeekIdx: number
      currentExercises: TrainingExerciseRow[]
      nextSessions: number
      nextDayIdx: number
      nextWeekIdx: number
      nextExercises: TrainingExerciseRow[]
    }
  | {
      kind: 'break'
      completedSessions: number
      completedMicrocycle: number
    }
  | { kind: 'done'; completedSessions: number }

export interface DeriveInput {
  allSaved: boolean
  missingExercises: string[]
  programDone: boolean
  isMicrocycleBreak: boolean
  completedSessions: number
  completedMicrocycle: number
  currentDayIdx: number
  currentWeekIdx: number
  currentTrainingExercises: TrainingExerciseRow[]
  nextSessions: number
  nextDayIdx: number
  nextWeekIdx: number
  nextTrainingExercises: TrainingExerciseRow[]
}

export function deriveTrainingState(input: DeriveInput): TrainingState {
  if (!input.allSaved) {
    return { kind: 'locked', missingExercises: input.missingExercises }
  }
  if (input.programDone) {
    return { kind: 'done', completedSessions: input.completedSessions }
  }
  // Микроцикл-отдых убран по просьбе пользователя: сразу показываем следующую тренировку.
  return {
    kind: 'active',
    completedSessions: input.completedSessions,
    currentDayIdx: input.currentDayIdx,
    currentWeekIdx: input.currentWeekIdx,
    currentExercises: input.currentTrainingExercises,
    nextSessions: input.nextSessions,
    nextDayIdx: input.nextDayIdx,
    nextWeekIdx: input.nextWeekIdx,
    nextExercises: input.nextTrainingExercises,
  }
}
