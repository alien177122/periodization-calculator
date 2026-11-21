import type {Block, TrainingDayDef, TrainingPreferences, UserData} from '../types';

import type {TrainingExerciseRow} from '../utils/training';
import TrainingStateRouter from '../components/training/TrainingStateRouter';
import {deriveTrainingState} from '../components/training/trainingState';

export interface TrainingTabProps {
  userData: UserData;
  allSaved: boolean;
  missingExercises: string[];
  completedSessions: number;
  currentDayIdx: number;
  currentWeekIdx: number;
  programDone: boolean;
  nextSessions: number;
  nextDayIdx: number;
  nextWeekIdx: number;
  isMicrocycleBreak: boolean;
  completedMicrocycle: number;
  currentTrainingExercises: TrainingExerciseRow[];
  nextTrainingExercises: TrainingExerciseRow[];
  handleComplete: () => void;
  handleReset: () => void;
  setRestDismissed: (value: boolean) => void;
  onGoCalculator: () => void;
  trainingPreferences: TrainingPreferences;
  updateTrainingPreferences: (patch: Partial<TrainingPreferences>) => void;
  totalSessions?: number;
  trainingDays?: TrainingDayDef[];
  programSubtitle?: string;
  currentBlocks?: Block[];
  nextBlocks?: Block[];
  onSetModeChange?: (dayNumber: number, blockId: string, setMode: 'linear' | 'pyramid' | 'cluster', cluster?: {miniReps: number; intraRestSec: number}) => void;
}

export default function TrainingTab(props: TrainingTabProps) {
  const state = deriveTrainingState({
    allSaved: props.allSaved,
    missingExercises: props.missingExercises,
    programDone: props.programDone,
    isMicrocycleBreak: props.isMicrocycleBreak,
    completedSessions: props.completedSessions,
    completedMicrocycle: props.completedMicrocycle,
    currentDayIdx: props.currentDayIdx,
    currentWeekIdx: props.currentWeekIdx,
    currentTrainingExercises: props.currentTrainingExercises,
    nextSessions: props.nextSessions,
    nextDayIdx: props.nextDayIdx,
    nextWeekIdx: props.nextWeekIdx,
    nextTrainingExercises: props.nextTrainingExercises,
  });

  return (
    <div className="ta-shell">

      <div className="ta-stack">
        <TrainingStateRouter
          state={state}
          totalSessions={props.totalSessions}
          trainingDays={props.trainingDays}
          trainingPreferences={props.trainingPreferences}
          currentBlocks={props.currentBlocks}
          nextBlocks={props.nextBlocks}
          handlers={{
            onGoCalculator: props.onGoCalculator,
            onComplete: props.handleComplete,
            onDismissBreak: () => props.setRestDismissed(true),
            onReset: props.handleReset,
            onPreferencesChange: props.updateTrainingPreferences,
            onSetModeChange: props.onSetModeChange,
          }}
        />
      </div>
    </div>
  );
}
