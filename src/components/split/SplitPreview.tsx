import TrainingDayCard from '../TrainingDayCard.tsx';
import '../../styles/components/training/training-day-card.css';
import {CATALOG_EXERCISES} from '../../data/exercises.ts';
import type {CustomSplit, SplitDayConfig, TrainingDayDef} from '../../types';
import type {TrainingExerciseRow} from '../../utils/training';
import {
  countCompletedDaysInWeek,
  getWeekProgressVisual,
  isWeekEffectivelyDone,
  type WeekProgressVisual,
} from '@training/shared/utils/split-progress';

interface DayPreview {
  day: SplitDayConfig;
  dayDef: TrainingDayDef;
  exercises: TrainingExerciseRow[];
}

interface SplitPreviewProps {
  split: CustomSplit;
  previewWeek: number;
  dayPreviews: DayPreview[];
  onWeekChange: (week: number) => void;
  onToggleWeekDone: (week: number) => void;
  onToggleDayDone: (week: number, day: 1 | 2 | 3 | 4) => void;
  onFixedWeightChange?: (exerciseKey: string, weekIndex: number, weight: number) => void;
}

const WEEK_COUNT = 8;

function isDayDone(split: CustomSplit, weekIndex: number, day: 1 | 2 | 3 | 4): boolean {
  return (split.completedDays ?? []).some(entry => entry.week === weekIndex && entry.day === day);
}

function getWeekStatus(
  weekIndex: number,
  previewWeek: number,
  visual: WeekProgressVisual,
): 'passed' | 'current' | 'upcoming' {
  if (visual === 'done') return 'passed';
  if (weekIndex === previewWeek) return 'current';
  return 'upcoming';
}

function getWeekStatusLabel(
  status: 'passed' | 'current' | 'upcoming',
  visual: WeekProgressVisual,
  dayDoneCount: number,
  dayTotal: number,
): string {
  if (visual === 'done') return 'выполнена';
  if (visual === 'partial') return `${dayDoneCount} из ${dayTotal} дней`;
  if (status === 'current') return 'просмотр';
  return 'впереди';
}

export function SplitPreview({
  split,
  previewWeek,
  dayPreviews,
  onWeekChange,
  onToggleWeekDone,
  onToggleDayDone,
  onFixedWeightChange,
}: SplitPreviewProps) {
  const hideWeights = split.weightMode === 'scheme_only';
  const weekDone = isWeekEffectivelyDone(split, previewWeek);
  const doneWeekCount = Array.from({length: WEEK_COUNT}, (_, index) => index).filter(week =>
    isWeekEffectivelyDone(split, week),
  ).length;
  const daysPerWeek = split.daysPerWeek === 4 ? 4 : split.daysPerWeek === 3 ? 3 : 2;

  return (
    <section className="app-tab-section split-preview" aria-labelledby="split-preview-title">
      <div className="app-tab-section__head">
        <h2 id="split-preview-title" className="app-tab-section__title">
          Превью недели
        </h2>
        <span className="app-tab-section__meta">
          Неделя {previewWeek + 1} из {WEEK_COUNT}
          {doneWeekCount > 0 ? ` · ${doneWeekCount} пройдено` : ''}
        </span>
      </div>

      <div className="split-preview__frame">
        <p className="split-preview__lede">
          Рабочий вес считается на уровне недели и не меняется внутри неё. Отмечайте пройденные дни
          — когда все дни недели отмечены, квадрат сверху становится выполненным. Отметки
          сохраняются в этом расчёте.
        </p>

        <div className="split-week-stepper" role="tablist" aria-label="Неделя">
          {Array.from({length: WEEK_COUNT}, (_, index) => {
            const visual = getWeekProgressVisual(split, index);
            const dayDoneCount = countCompletedDaysInWeek(split, index);
            const status = getWeekStatus(index, previewWeek, visual);
            const statusLabel = getWeekStatusLabel(status, visual, dayDoneCount, daysPerWeek);

            return (
              <button
                key={index}
                type="button"
                role="tab"
                className={`split-week-btn split-week-btn--${status}${
                  previewWeek === index ? ' is-active' : ''
                }${visual === 'done' ? ' is-done' : ''}${visual === 'partial' ? ' is-partial' : ''}`}
                data-status={status}
                data-progress={visual}
                aria-selected={previewWeek === index}
                aria-current={previewWeek === index ? 'step' : undefined}
                aria-label={`Неделя ${index + 1}: ${statusLabel}`}
                onClick={() => onWeekChange(index)}>
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="split-week-progress">
          <div className="split-week-progress__actions">
            <button
              type="button"
              className={`btn${weekDone ? ' btn-ghost' : ' calc-test__submit'} split-week-done-btn`}
              onClick={() => onToggleWeekDone(previewWeek)}
              aria-pressed={weekDone}>
              {weekDone
                ? `Снять отметку с недели ${previewWeek + 1}`
                : `Отметить неделю ${previewWeek + 1} пройденной`}
            </button>
          </div>

          <div className="split-week-progress__days" role="group" aria-label="Дни прогрессии">
            <p className="split-week-progress__label">Дни недели {previewWeek + 1}</p>
            {dayPreviews.map(({day, dayDef}) => {
              const dayNumber = day.dayNumber as 1 | 2 | 3;
              const done = isDayDone(split, previewWeek, dayNumber);
              return (
                <button
                  key={dayNumber}
                  type="button"
                  className={`split-day-done-btn${done ? ' is-done' : ''}`}
                  aria-pressed={done}
                  onClick={() => onToggleDayDone(previewWeek, dayNumber)}>
                  {done ? '✓ ' : ''}
                  {dayDef.name}
                </button>
              );
            })}
          </div>
        </div>

        {dayPreviews.map(({dayDef, exercises}) => (
          <TrainingDayCard
            key={dayDef.dayNumber}
            dayDef={dayDef}
            weekIndex={previewWeek}
            exercises={exercises}
            hideWeights={hideWeights}
            variant="split-preview"
          />
        ))}

        {split.weightMode === 'fixed' && onFixedWeightChange ? (
          <FixedWeightsEditor
            weekIndex={previewWeek}
            dayPreviews={dayPreviews}
            fixedWeights={split.fixedWeights ?? {}}
            onChange={onFixedWeightChange}
          />
        ) : null}
      </div>
    </section>
  );
}

function FixedWeightsEditor({
  weekIndex,
  dayPreviews,
  fixedWeights,
  onChange,
}: {
  weekIndex: number;
  dayPreviews: DayPreview[];
  fixedWeights: Record<string, number[]>;
  onChange: (exerciseKey: string, weekIndex: number, weight: number) => void;
}) {
  const keys = [...new Set(dayPreviews.flatMap(day => day.exercises.map(row => row.key)))];

  return (
    <div className="split-fixed-weights">
      <p className="split-section-label">Фиксированные веса (неделя {weekIndex + 1})</p>
      {keys.map(key => (
        <div key={key} className="split-fixed-row">
          <span>{CATALOG_EXERCISES[key]?.name ?? key}</span>
          <input
            className="split-input"
            aria-label={`Фиксированный вес для ${CATALOG_EXERCISES[key]?.name ?? key}`}
            type="number"
            min="0"
            step="0.5"
            value={fixedWeights[key]?.[weekIndex] ?? ''}
            onChange={event => onChange(key, weekIndex, parseFloat(event.target.value) || 0)}
          />
        </div>
      ))}
    </div>
  );
}
