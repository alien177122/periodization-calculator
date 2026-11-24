import { useEffect, useMemo, useState } from 'react';
import type { CustomSplit, SavedExercise, SplitDayNumber } from '../../types';
import type { TrainingExerciseRow } from '../../utils/training';
import type { TrainingDayDef } from '../../types';
import { SectionBlock } from '../SectionBlock';
import { SplitPreview } from '../split/SplitPreview';
import { buildDayPreview } from '@training/shared/utils/split-constructor';
import {
  applyToggleCompletedDay,
  applyToggleCompletedWeek,
} from '@training/shared/utils/split-progress';

const WEEK_COUNT = 8;

interface SplitWeekSectionProps {
  split: CustomSplit;
  savedExercises: SavedExercise[];
  /** Текущая неделя программы — стартовая точка просмотра. */
  initialWeek: number;
  onSplitChange: (next: CustomSplit) => void;
  onSetModeChange?: (
    dayNumber: 1 | 2 | 3 | 4,
    blockId: string,
    setMode: 'linear' | 'pyramid' | 'cluster',
    cluster?: { miniReps: number; intraRestSec: number },
  ) => void;
}

function clampWeek(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(WEEK_COUNT - 1, Math.max(0, Math.round(value)));
}

/**
 * Сплит недели на главном экране «Тренировки»: недельный степпер,
 * отметки дней и те же контейнеры дней, что в конструкторе расчёта.
 */
export function SplitWeekSection({
  split,
  savedExercises,
  initialWeek,
  onSplitChange,
  onSetModeChange,
}: SplitWeekSectionProps) {
  const [previewWeek, setPreviewWeek] = useState(() => clampWeek(initialWeek));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviewWeek(clampWeek(initialWeek));
  }, [initialWeek]);

  const dayPreviews = useMemo(() => {
    return split.days.map(day => {
      const exercises: TrainingExerciseRow[] = buildDayPreview({
        split,
        dayNumber: day.dayNumber,
        weekIndex: previewWeek,
        savedExercises,
      });
      const dayDef: TrainingDayDef = {
        dayNumber: day.dayNumber,
        name: day.label ?? `День ${day.dayNumber}`,
        exerciseKeys: exercises.map(row => row.key),
      };
      return { day, dayDef, exercises };
    });
  }, [previewWeek, savedExercises, split]);

  const handleToggleWeek = (weekIndex: number) => {
    onSplitChange(applyToggleCompletedWeek(split, weekIndex));
  };

  const handleToggleDay = (weekIndex: number, day: SplitDayNumber) => {
    onSplitChange(applyToggleCompletedDay(split, weekIndex, day));
  };

  const handleFixedWeight = (exerciseKey: string, weekIndex: number, weight: number) => {
    const weeks = [...(split.fixedWeights?.[exerciseKey] ?? Array(WEEK_COUNT).fill(0))];
    weeks[weekIndex] = weight;
    onSplitChange({
      ...split,
      weightMode: 'fixed',
      fixedWeights: {...split.fixedWeights, [exerciseKey]: weeks},
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <SectionBlock num="04" title="Сплит недели" variant="apple" className="training-section">
      <SplitPreview
        split={split}
        previewWeek={previewWeek}
        dayPreviews={dayPreviews}
        onWeekChange={setPreviewWeek}
        onToggleWeekDone={handleToggleWeek}
        onToggleDayDone={handleToggleDay}
        onFixedWeightChange={handleFixedWeight}
        onSetModeChange={onSetModeChange}
        showHead={false}
      />
    </SectionBlock>
  );
}
