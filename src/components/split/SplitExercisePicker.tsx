import {useId, useMemo, useRef, type CSSProperties, type KeyboardEvent} from 'react';
import '../../styles/components/split/split-exercise-picker.css';
import {
  LOWER_BODY_MUSCLES,
  SPLIT_MUSCLE_COLORS,
  SPLIT_MUSCLE_LABELS,
  UPPER_BODY_MUSCLES,
} from '@training/shared/data/split-muscles';
import type {SavedExercise} from '../../types';
import {
  useSplitExercisePicker,
  type SplitExercisePickerItem,
} from '../../hooks/useSplitExercisePicker';
import {SplitMuscleIcon} from './splitMuscleIcons';

/** Legend order: upper groups, then legs — matches filter chip order. */
const MUSCLE_COLOR_LEGEND = [...UPPER_BODY_MUSCLES, ...LOWER_BODY_MUSCLES];

/** 1 → упражнение · 2–4 → упражнения · 5+ → упражнений */
function plural(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'упражнение';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'упражнения';
  return 'упражнений';
}

interface SplitExercisePickerProps {
  value: string;
  onChange: (key: string) => void;
  savedExercises?: SavedExercise[];
  labelledBy?: string;
  /** When false, hide calculator 1RM badges (e.g. journal trend picker). Default true. */
  showOneRM?: boolean;
}

export function SplitExercisePicker({
  value,
  onChange,
  savedExercises = [],
  labelledBy,
  showOneRM = true,
}: SplitExercisePickerProps) {
  const {
    regionFilter,
    muscleFilter,
    regionOptions,
    muscleOptions,
    filteredItems,
    selectRegion,
    selectMuscle,
  } = useSplitExercisePicker();

  const gridRef = useRef<HTMLDivElement>(null);
  const regionGroupId = useId();
  const muscleGroupId = useId();
  const gridLabelId = useId();

  const savedMap = useMemo(
    () => new Map(savedExercises.map(saved => [saved.exerciseKey, saved])),
    [savedExercises],
  );

  function handlePick(key: string) {
    onChange(key);
  }

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    const buttons = Array.from(
      gridRef.current?.querySelectorAll<HTMLButtonElement>('.split-ex-picker__card') ?? [],
    );
    if (buttons.length === 0) return;

    const currentIndex = buttons.findIndex(button => button === document.activeElement);
    if (currentIndex === -1) return;

    event.preventDefault();

    const columns = getGridColumnCount(gridRef.current);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = Math.min(currentIndex + 1, buttons.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'ArrowDown':
        nextIndex = Math.min(currentIndex + columns, buttons.length - 1);
        break;
      case 'ArrowUp':
        nextIndex = Math.max(currentIndex - columns, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = buttons.length - 1;
        break;
    }

    buttons[nextIndex]?.focus({preventScroll: true});
  };

  return (
    <div className="split-ex-picker" aria-labelledby={labelledBy}>
      <div className="split-ex-picker__toolbar">
        <div className="split-ex-picker__filters">
          <div
            className="split-ex-picker__filter-row"
            role="group"
            aria-labelledby={`${regionGroupId}-label`}>
            <span id={`${regionGroupId}-label`} className="split-ex-picker__filter-label">
              Зона
            </span>
            <div className="split-ex-picker__chips">
              {regionOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`split-ex-picker__chip${
                    regionFilter === option.value ? ' is-active' : ''
                  }`}
                  aria-pressed={regionFilter === option.value}
                  onClick={() => selectRegion(option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div
            className="split-ex-picker__filter-row"
            role="group"
            aria-labelledby={`${muscleGroupId}-label`}>
            <span id={`${muscleGroupId}-label`} className="split-ex-picker__filter-label">
              Группа
            </span>
            <div className="split-ex-picker__chips split-ex-picker__chips--wrap">
              {muscleOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={`split-ex-picker__chip split-ex-picker__chip--muscle${
                    muscleFilter === option.value ? ' is-active' : ''
                  }`}
                  aria-pressed={muscleFilter === option.value}
                  onClick={() => selectMuscle(option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <ul className="split-ex-picker__legend" aria-label="Цвета мышечных групп">
          {MUSCLE_COLOR_LEGEND.map(muscle => (
            <li
              key={muscle}
              className="split-ex-picker__legend-item"
              style={{'--split-ex-muscle-color': SPLIT_MUSCLE_COLORS[muscle]} as CSSProperties}>
              <span className="split-ex-picker__legend-swatch" aria-hidden="true" />
              <span className="split-ex-picker__legend-label">{SPLIT_MUSCLE_LABELS[muscle]}</span>
            </li>
          ))}
        </ul>
      </div>

      <p id={gridLabelId} className="split-ex-picker__grid-hint">
        {filteredItems.length > 0
          ? `${filteredItems.length} ${plural(filteredItems.length)} — выбери карточку`
          : 'Нет упражнений для выбранных фильтров'}
      </p>

      <div
        ref={gridRef}
        className="split-ex-picker__grid"
        role="listbox"
        aria-labelledby={gridLabelId}
        aria-activedescendant={value ? `split-ex-card-${value}` : undefined}
        onKeyDown={handleGridKeyDown}>
        {filteredItems.map((item, index) => (
          <SplitExerciseCard
            key={item.key}
            item={item}
            index={index}
            selected={item.key === value}
            saved={savedMap.get(item.key)}
            showOneRM={showOneRM}
            onPick={handlePick}
          />
        ))}
      </div>
    </div>
  );
}

function SplitExerciseCard({
  item,
  index,
  selected,
  saved,
  showOneRM,
  onPick,
}: {
  item: SplitExercisePickerItem;
  index: number;
  selected: boolean;
  saved?: SavedExercise;
  showOneRM: boolean;
  onPick: (key: string) => void;
}) {
  return (
    <button
      id={`split-ex-card-${item.key}`}
      type="button"
      role="option"
      aria-selected={selected}
      aria-pressed={selected}
      aria-label={`${item.name}, ${item.muscleLabel}`}
      className={`split-ex-picker__card${selected ? ' is-selected' : ''}${
        showOneRM ? '' : ' split-ex-picker__card--no-rm'
      }`}
      style={
        {
          '--split-ex-type-color': item.typeColor,
          '--split-ex-muscle-color': item.muscleColor,
          '--split-ex-card-index': index,
        } as CSSProperties
      }
      onClick={() => onPick(item.key)}>
      <span className="split-ex-picker__card-body">
        <span className="split-ex-picker__card-copy">
          <strong className="split-ex-picker__card-name">{item.name}</strong>
          <span className="split-ex-picker__card-type">{item.typeLabel}</span>
        </span>
        {showOneRM ? (
          saved && saved.oneRM > 0 ? (
            <span className="split-ex-picker__card-rm">{saved.oneRM} кг 1ПМ</span>
          ) : (
            <span className="split-ex-picker__card-rm split-ex-picker__card-rm--empty">
              1ПМ не задан
            </span>
          )
        ) : null}
        <span className="split-ex-picker__card-aside" aria-hidden="true">
          <SplitMuscleIcon muscle={item.muscle} className="split-ex-picker__card-icon" />
          <span className="split-ex-picker__card-muscle">{item.muscleLabel}</span>
        </span>
      </span>
    </button>
  );
}

function getGridColumnCount(container: HTMLDivElement | null): number {
  /* Mobile-first list = 1 col; 600px+ = 2; 900px+ = 3 (matches CSS). */
  if (!container) return 1;
  const style = window.getComputedStyle(container);
  const template = style.gridTemplateColumns;
  if (!template || template === 'none') return 1;
  return template.split(' ').filter(Boolean).length || 1;
}
