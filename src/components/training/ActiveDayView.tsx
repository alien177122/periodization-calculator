import {TRAINING_DAYS} from '../../data/exercises';
import type {Block, TrainingDayDef, TrainingPreferences} from '../../types';
import type {TrainingExerciseRow} from '../../utils/training';
import TrainingDayCard from '../TrainingDayCard';
import {ExerciseTimers} from './ExerciseTimers';
import {BlockTimer} from './BlockTimer';
import {SectionBlock} from '../SectionBlock';
import {Button} from '../ui/Button';
import ProgressionControls from './ProgressionControls';

interface ActiveDayViewProps {
  currentDayIdx: number;
  currentWeekIdx: number;
  currentExercises: TrainingExerciseRow[];
  nextSessions: number;
  nextDayIdx: number;
  nextWeekIdx: number;
  nextExercises: TrainingExerciseRow[];
  trainingPreferences: TrainingPreferences;
  onPreferencesChange: (patch: Partial<TrainingPreferences>) => void;
  onComplete: () => void;
  totalSessions?: number;
  trainingDays?: TrainingDayDef[];
  currentBlocks?: Block[];
  nextBlocks?: Block[];
  onSetModeChange?: (blockId: string, setMode: 'linear' | 'pyramid' | 'cluster', cluster?: {miniReps: number; intraRestSec: number}) => void;
}

export default function ActiveDayView({
  currentDayIdx,
  currentWeekIdx,
  currentExercises,
  nextSessions,
  nextDayIdx,
  nextWeekIdx,
  nextExercises,
  trainingPreferences,
  onPreferencesChange,
  onComplete,
  totalSessions = 24,
  trainingDays = TRAINING_DAYS,
  currentBlocks,
  nextBlocks,
  onSetModeChange,
}: ActiveDayViewProps) {
  const showPreview = nextSessions < totalSessions;
  const currentDay = trainingDays[currentDayIdx];
  const nextDay = trainingDays[nextDayIdx];

  return (
    <>
      <SectionBlock num="01" title="Текущая тренировка">
        <ProgressionControls preferences={trainingPreferences} onChange={onPreferencesChange} />
        {currentDay ? (
          <>
            <BlockTimer />
            <ExerciseTimers exercises={currentExercises} />
            <TrainingDayCard
              dayDef={currentDay}
              weekIndex={currentWeekIdx}
              exercises={currentExercises}
              persistedBlocks={currentBlocks}
              onSetModeChange={onSetModeChange}
            />
          </>
        ) : null}
        <Button className="calc-test__submit" onClick={onComplete}>
          Завершить тренировку
        </Button>
      </SectionBlock>

      {showPreview && nextDay ? (
        <SectionBlock num="02" title="Следующая тренировка">
          <div className="next-day-label">Предпросмотр</div>
          <TrainingDayCard
            dayDef={nextDay}
            weekIndex={nextWeekIdx}
            exercises={nextExercises}
            isPreview
            persistedBlocks={nextBlocks}
            onSetModeChange={onSetModeChange}
          />
        </SectionBlock>
      ) : null}
    </>
  );
}
