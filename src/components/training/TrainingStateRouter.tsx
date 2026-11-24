import type {Block, TrainingDayDef, TrainingPreferences} from '../../types';
import type {TrainingState} from './trainingState';
import LockedState from './LockedState';
import ActiveDayView from './ActiveDayView';
import RestState from './RestState';
import DoneState from './DoneState';

interface Handlers {
  onGoCalculator: () => void;
  onComplete: () => void;
  onDismissBreak: () => void;
  onReset: () => void;
  onPreferencesChange: (patch: Partial<TrainingPreferences>) => void;
  onSetModeChange?: (dayNumber: number, blockId: string, setMode: 'linear' | 'pyramid' | 'cluster', cluster?: {miniReps: number; intraRestSec: number}) => void;
}

interface TrainingStateRouterProps {
  state: TrainingState;
  handlers: Handlers;
  trainingPreferences: TrainingPreferences;
  totalSessions?: number;
  trainingDays?: TrainingDayDef[];
  currentBlocks?: Block[];
  nextBlocks?: Block[];
}

export default function TrainingStateRouter({
  state,
  handlers,
  trainingPreferences,
  totalSessions = 24,
  trainingDays,
  currentBlocks,
  nextBlocks,
}: TrainingStateRouterProps) {
  switch (state.kind) {
    case 'locked':
      return (
        <LockedState
          missingExercises={state.missingExercises}
          onGoCalculator={handlers.onGoCalculator}
        />
      );
    case 'active':
      return (
        <>
          <ActiveDayView
            currentDayIdx={state.currentDayIdx}
            currentWeekIdx={state.currentWeekIdx}
            currentExercises={state.currentExercises}
            nextSessions={state.nextSessions}
            nextDayIdx={state.nextDayIdx}
            nextWeekIdx={state.nextWeekIdx}
            nextExercises={state.nextExercises}
            trainingPreferences={trainingPreferences}
            onPreferencesChange={handlers.onPreferencesChange}
            onComplete={handlers.onComplete}
            totalSessions={totalSessions}
            trainingDays={trainingDays}
            currentBlocks={currentBlocks}
            nextBlocks={nextBlocks}
            onSetModeChange={handlers.onSetModeChange}
          />
        </>
      );
    case 'break':
      return (
        <>
          <RestState
            onDismiss={handlers.onDismissBreak}
          />
        </>
      );
    case 'done':
      return <DoneState completedSessions={state.completedSessions} onReset={handlers.onReset} />;
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
