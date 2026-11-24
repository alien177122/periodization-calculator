import {useMemo, type CSSProperties} from 'react';
import {CATALOG_EXERCISES} from '@training/shared/data/exercises';
import {exerciseKeysForDay} from '@training/shared/utils/split-constructor';
import {
  DAY_SCHEME_LIMITS,
  daySchemeOverridesFor,
  resolveDayScheme,
} from '@training/shared/data/split-schemes';
import {
  pairForExercise,
  pairLoopHint,
  pairPartner,
} from '@training/shared/data/split-pairs';
import type {
  CustomSplit,
  SavedExercise,
  SplitDayNumber,
  WeekScheme,
} from '../../types';

interface MuscleDayGridProps {
  split: CustomSplit;
  savedExercises: SavedExercise[];
  onDuplicateExercise: (exerciseKey: string, targetDay: 1 | 2 | 3 | 4) => void;
  onRemoveExercise: (exerciseKey: string, dayNumber: 1 | 2 | 3 | 4) => void;
  /** Схема подходов упражнения в дне (S1). null = вернуть схему программы. */
  onSchemeChange?: (
    exerciseKey: string,
    dayNumber: SplitDayNumber,
    scheme: WeekScheme | null,
  ) => void;
  /** Связка упражнений дня (S3). null = разорвать связь. */
  onPairChange?: (
    exerciseKey: string,
    dayNumber: SplitDayNumber,
    partnerKey: string | null,
  ) => void;
}

function exerciseCountLabel(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} упражнение`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} упражнения`;
  return `${count} упражнений`;
}

function SplitExerciseOneRMInput({
  exerciseKey,
  saved,
}: {
  exerciseKey: string;
  saved: SavedExercise | undefined;
}) {
  const config = CATALOG_EXERCISES[exerciseKey];
  const isBodyWeightLift = Boolean(
    config?.usesBodyWeight || (config as {isPullup?: boolean}).isPullup,
  );

  if (!config) return null;

  if (!saved || saved.oneRM <= 0) {
    return (
      <div className="split-exercise-card__static-rm">
        <span className="split-exercise-card__static-label">1ПМ:</span>
        <span className="split-exercise-card__static-value split-exercise-card__static-value--none">
          не задан
        </span>
      </div>
    );
  }

  if (isBodyWeightLift) {
    const extraWeight = Math.max(0, saved.oneRM - (saved.bodyWeight ?? 0));
    return (
      <div className="split-exercise-card__static-rm">
        <span className="split-exercise-card__static-label">1ПМ:</span>
        <div className="split-exercise-card__static-value-group">
          <span className="split-exercise-card__static-value">
            {saved.oneRM.toFixed(1).replace('.0', '')} кг
          </span>
          <span className="split-exercise-card__static-details">
            (вес тела + {extraWeight.toFixed(1).replace('.0', '')} кг)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="split-exercise-card__static-rm">
      <span className="split-exercise-card__static-label">1ПМ:</span>
      <span className="split-exercise-card__static-value">
        {saved.oneRM.toFixed(1).replace('.0', '')} кг
      </span>
    </div>
  );
}

function ExerciseSchemeControl({
  scheme,
  overridden,
  onChange,
}: {
  scheme: WeekScheme | undefined;
  overridden: boolean;
  onChange: (scheme: WeekScheme | null) => void;
}) {
  if (!scheme) return null;

  const changeSets = (delta: number) =>
    onChange({
      sets: Math.min(
        DAY_SCHEME_LIMITS.MAX_SETS,
        Math.max(DAY_SCHEME_LIMITS.MIN_SETS, scheme.sets + delta),
      ),
      reps: scheme.reps,
    });
  const changeReps = (delta: number) =>
    onChange({
      sets: scheme.sets,
      reps: Math.min(
        DAY_SCHEME_LIMITS.MAX_REPS,
        Math.max(DAY_SCHEME_LIMITS.MIN_REPS, scheme.reps + delta),
      ),
    });

  return (
    <div className="split-exercise-card__scheme">
      <span className="split-exercise-card__scheme-title">Схема</span>
      <div className="split-scheme-stepper">
        <span className="split-scheme-stepper__label">подходы</span>
        <button
          type="button"
          className="split-scheme-stepper__btn"
          onClick={() => changeSets(-1)}
          disabled={scheme.sets <= DAY_SCHEME_LIMITS.MIN_SETS}
          aria-label="Меньше подходов">
          −
        </button>
        <span className="split-scheme-stepper__value">{scheme.sets}</span>
        <button
          type="button"
          className="split-scheme-stepper__btn"
          onClick={() => changeSets(1)}
          disabled={scheme.sets >= DAY_SCHEME_LIMITS.MAX_SETS}
          aria-label="Больше подходов">
          +
        </button>
      </div>
      <div className="split-scheme-stepper">
        <span className="split-scheme-stepper__label">повторы</span>
        <button
          type="button"
          className="split-scheme-stepper__btn"
          onClick={() => changeReps(-1)}
          disabled={scheme.reps <= DAY_SCHEME_LIMITS.MIN_REPS}
          aria-label="Меньше повторов">
          −
        </button>
        <span className="split-scheme-stepper__value">{scheme.reps}</span>
        <button
          type="button"
          className="split-scheme-stepper__btn"
          onClick={() => changeReps(1)}
          disabled={scheme.reps >= DAY_SCHEME_LIMITS.MAX_REPS}
          aria-label="Больше повторов">
          +
        </button>
      </div>
      {overridden ? (
        <button
          type="button"
          className="split-exercise-card__scheme-reset"
          onClick={() => onChange(null)}>
          как в программе
        </button>
      ) : null}
    </div>
  );
}

function ExercisePairControl({
  split,
  dayNumber,
  exerciseKey,
  dayKeys,
  onChange,
}: {
  split: CustomSplit;
  dayNumber: SplitDayNumber;
  exerciseKey: string;
  dayKeys: string[];
  onChange: (partnerKey: string | null) => void;
}) {
  const pair = pairForExercise(split, dayNumber, exerciseKey);
  const partnerKey = pair ? pairPartner(pair, exerciseKey) : undefined;
  const options = dayKeys.filter(key => key !== exerciseKey);
  if (options.length === 0) return null;

  const nameFor = (key: string) => CATALOG_EXERCISES[key]?.name ?? key;

  return (
    <div className="split-exercise-card__pair">
      <label className="split-exercise-card__pair-label">
        <span>Связка</span>
        <select
          className="split-exercise-card__pair-select"
          value={partnerKey ?? ''}
          aria-label={`Связка для ${nameFor(exerciseKey)}`}
          onChange={event => onChange(event.target.value || null)}>
          <option value="">нет</option>
          {options.map(key => (
            <option key={key} value={key}>
              {nameFor(key)}
            </option>
          ))}
        </select>
      </label>
      {pair && partnerKey ? (
        <span className="split-exercise-card__pair-hint">
          {nameFor(partnerKey)} · между подходами {pairLoopHint(pair)}
        </span>
      ) : null}
    </div>
  );
}

export function MuscleDayGrid({
  split,
  savedExercises,
  onDuplicateExercise,
  onRemoveExercise,
  onSchemeChange,
  onPairChange,
}: MuscleDayGridProps) {
  const savedByKey = useMemo(
    () => new Map(savedExercises.map(saved => [saved.exerciseKey, saved])),
    [savedExercises],
  );

  const keysByDay = useMemo(() => {
    const map = new Map<SplitDayNumber, string[]>();
    for (const day of split.days) {
      map.set(day.dayNumber, exerciseKeysForDay(split, day.dayNumber));
    }
    return map;
  }, [split]);

  return (
    <section className="app-tab-section split-exercises" aria-labelledby="split-exercises-title">
      <div className="app-tab-section__head">
        <h2 id="split-exercises-title" className="app-tab-section__title">
          Упражнения
        </h2>
      </div>
      <p className="split-exercises__hint">
        Укажите силовые показатели. Кнопка «+ День N» — копия на следующий день, крестик — убрать из
        дня.
      </p>

      <div
        className={`split-day-grid${split.daysPerWeek === 2 ? ' is-two-days' : ' is-three-days'}`}>
        {split.days.map((day, dayIndex) => {
          const exerciseKeys = keysByDay.get(day.dayNumber) ?? [];
          const nextDay = split.days[(dayIndex + 1) % split.days.length];
          const nextDayKeys = keysByDay.get(nextDay.dayNumber) ?? [];
          const titleId = `split-day-${day.dayNumber}-title`;

          return (
            <article
              key={day.dayNumber}
              className="split-day-card"
              data-day={day.dayNumber}
              aria-labelledby={titleId}>
              <header className="split-day-card__head">
                <span className="split-day-card__badge" aria-hidden="true">
                  {day.dayNumber}
                </span>
                <div className="split-day-card__titles">
                  <h3 id={titleId} className="split-day-card__title">
                    День {day.dayNumber}
                  </h3>
                  <span className="split-day-card__count">
                    {exerciseCountLabel(exerciseKeys.length)}
                  </span>
                </div>
              </header>

              {exerciseKeys.length === 0 ? (
                <p className="split-day-card__empty">
                  Нет упражнений. Верните из списка ниже или измените группы мышц.
                </p>
              ) : null}

              <ul className="split-day-card__list">
                {exerciseKeys.map((exerciseKey, exerciseIndex) => {
                  const config = CATALOG_EXERCISES[exerciseKey];
                  if (!config) return null;

                  const canDuplicate =
                    nextDay.dayNumber !== day.dayNumber && !nextDayKeys.includes(exerciseKey);

                  return (
                    <li
                      key={exerciseKey}
                      className="split-exercise-card"
                      style={{'--split-card-index': exerciseIndex} as CSSProperties}>
                      <div className="split-exercise-card__main">
                        <div className="split-exercise-card__headline">
                          <span className="split-exercise-card__name-text">{config.name}</span>
                          <div className="split-exercise-card__actions">
                            {canDuplicate ? (
                              <button
                                type="button"
                                className="split-exercise-card__duplicate"
                                aria-label={`Дублировать ${config.name} на день ${nextDay.dayNumber}`}
                                onClick={() => onDuplicateExercise(exerciseKey, nextDay.dayNumber)}>
                                <span
                                  className="split-exercise-card__duplicate-icon"
                                  aria-hidden="true">
                                  +
                                </span>
                                <span className="split-exercise-card__duplicate-label">
                                  День {nextDay.dayNumber}
                                </span>
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="split-exercise-card__remove"
                              aria-label={`Убрать ${config.name} из дня ${day.dayNumber}`}
                              onClick={() => onRemoveExercise(exerciseKey, day.dayNumber)}>
                              <span aria-hidden="true">×</span>
                            </button>
                          </div>
                        </div>
                        <div className="split-exercise-card__rm">
                          <SplitExerciseOneRMInput
                            exerciseKey={exerciseKey}
                            saved={savedByKey.get(exerciseKey)}
                          />
                        </div>
                        {onSchemeChange ? (
                          <ExerciseSchemeControl
                            scheme={resolveDayScheme({
                              split,
                              dayNumber: day.dayNumber,
                              exerciseKey,
                              weekIndex: 0,
                            })}
                            overridden={Boolean(
                              daySchemeOverridesFor(split, day.dayNumber)[exerciseKey],
                            )}
                            onChange={scheme => onSchemeChange(exerciseKey, day.dayNumber, scheme)}
                          />
                        ) : null}
                        {onPairChange ? (
                          <ExercisePairControl
                            split={split}
                            dayNumber={day.dayNumber}
                            exerciseKey={exerciseKey}
                            dayKeys={exerciseKeys}
                            onChange={partner => onPairChange(exerciseKey, day.dayNumber, partner)}
                          />
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {(() => {
                let totalSets = 0;
                let legSets = 0;
                for (const key of exerciseKeys) {
                  const cfg = CATALOG_EXERCISES[key];
                  const scheme = resolveDayScheme({
                    split,
                    dayNumber: day.dayNumber,
                    exerciseKey: key,
                    weekIndex: 0,
                  });
                  if (scheme) {
                    totalSets += scheme.sets;
                    if (cfg?.primaryMuscle === 'legs') legSets += scheme.sets;
                  }
                }
                const hints: string[] = [];
                if (totalSets >= 24) hints.push('Много на день — следи за восстановлением.');
                else if (totalSets > 0 && totalSets <= 8) hints.push('Мало объёма — добавь 1–2 упражнения.');
                if (legSets > 0 && legSets < 6) hints.push('Мало для ног — добавь подходов.');
                if (hints.length === 0) return null;
                return <p className="split-day-card__volume-hint">{hints.join(' ')}</p>;
              })()}
            </article>
          );
        })}
      </div>
    </section>
  );
}
