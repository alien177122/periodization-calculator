import {CATALOG_EXERCISES} from '@training/shared/data/exercises';
import {SplitPreview} from './SplitPreview.tsx';
import {SplitForecastChart} from './SplitForecastChart.tsx';
import type {CustomSplit, SavedExercise} from '../../types';
import type {SplitDayNumber} from '@training/shared/types';

interface DayPreview {
  day: {dayNumber: SplitDayNumber};
  dayDef: {dayNumber: SplitDayNumber; name: string; exerciseKeys: string[]};
  exercises: unknown[];
}

interface SplitCalculationPanelProps {
  split: CustomSplit;
  previewWeek: number;
  dayPreviews: DayPreview[];
  previewExercises: SavedExercise[];
  missingWeightKeys: string[];
  weightsReady: boolean;
  onWeekChange: (week: number) => void;
  onToggleWeekDone: (week: number) => void;
  onToggleDayDone: (week: number, day: SplitDayNumber) => void;
  onFixedWeightChange?: (exerciseKey: string, weekIndex: number, weight: number) => void;
}

export function SplitCalculationPanel({
  split,
  previewWeek,
  dayPreviews,
  previewExercises,
  missingWeightKeys,
  weightsReady,
  onWeekChange,
  onToggleWeekDone,
  onToggleDayDone,
  onFixedWeightChange,
}: SplitCalculationPanelProps) {
  const missingLabels = missingWeightKeys
    .slice(0, 3)
    .map(key => CATALOG_EXERCISES[key]?.name ?? key);
  const missingTail = missingWeightKeys.length > 3 ? ` и ещё ${missingWeightKeys.length - 3}` : '';

  return (
    <div className="split-hub__calc-panel">
      {!weightsReady ? (
        <p className="split-hub__placeholder" role="status">
          Заполни веса для: {missingLabels.join(', ')}
          {missingTail || ' — выбери упражнения в базе или в расчёте.'}
        </p>
      ) : null}
      <SplitPreview
        split={split}
        previewWeek={previewWeek}
        dayPreviews={dayPreviews as Parameters<typeof SplitPreview>[0]['dayPreviews']}
        onWeekChange={onWeekChange}
        onToggleWeekDone={onToggleWeekDone}
        onToggleDayDone={onToggleDayDone}
        onFixedWeightChange={onFixedWeightChange}
      />
      {weightsReady ? <SplitForecastChart split={split} savedExercises={previewExercises} /> : null}
    </div>
  );
}
