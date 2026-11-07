import {TRAINING_DAYS} from '../../data/exercises';
import type {TrainingDayDef, TrainingPreferences} from '../../types';
import type {TrainingExerciseRow} from '../../utils/training';
import TrainingDayCard from '../TrainingDayCard';
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
}: ActiveDayViewProps) {
  const showPreview = nextSessions < totalSessions;
  const currentDay = trainingDays[currentDayIdx];
  const nextDay = trainingDays[nextDayIdx];

  return (
    <>
      <SectionBlock num="01" title="Текущая тренировка">
        <ProgressionControls preferences={trainingPreferences} onChange={onPreferencesChange} />
        {currentDay ? (
          <TrainingDayCard
            dayDef={currentDay}
            weekIndex={currentWeekIdx}
            exercises={currentExercises}
          />
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
          />
        </SectionBlock>
      ) : null}
    </>
  );
}
