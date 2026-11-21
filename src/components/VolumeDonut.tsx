import {useId, useMemo, useState, type CSSProperties, type KeyboardEvent} from 'react';
import {CAT_META, CAT_ORDER, MUSCLE_META, MUSCLE_ORDER} from '../data/muscles';
import {donutArc} from '../utils/geometry';
import {
  computeMuscleVolumeBreakdown,
  type MuscleBreakdown,
  type VolumeCategory,
  type VolumeSource,
} from '../utils/volume-breakdown';

type DonutSegment = {
  id: string;
  value: number;
  percent: number;
  startDeg: number;
  endDeg: number;
  catKey: VolumeCategory;
};

type CategoryArc = {
  catKey: VolumeCategory;
  startDeg: number;
  endDeg: number;
};

const SEGMENT_GAP = 1.5;
const CATEGORY_GAP = 5;
const DONUT_CENTER = 120;
const OUTER_RADIUS_OUT = 108;
const OUTER_RADIUS_IN = 96;
const INNER_RADIUS_OUT = 92;
const INNER_RADIUS_IN = 56;

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatPercent(value: number): string {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function sourceStyle(source: VolumeSource, total: number): CSSProperties {
  const width = total > 0 ? Math.max(6, (source.sets / total) * 100) : 0;
  return {'--vol-source-bar': `${width}%`} as CSSProperties;
}

function rowStyle(muscle: MuscleBreakdown, maxValue: number): CSSProperties {
  const color = MUSCLE_META[muscle.id]?.color ?? 'var(--ta-calc-accent)';
  const width = maxValue > 0 ? Math.max(8, (muscle.value / maxValue) * 100) : 0;
  return {
    '--vol-color': color,
    '--vol-bar': `${width}%`,
  } as CSSProperties;
}

function segmentStyle(muscleId: string): CSSProperties {
  return {
    '--vol-color': MUSCLE_META[muscleId]?.color ?? 'var(--ta-calc-accent)',
  } as CSSProperties;
}

function getSegmentOpacity(
  selectedId: string | null,
  segmentId: string,
  segmentCat: VolumeCategory,
): number {
  if (!selectedId) return 0.9;
  const selectedCat = MUSCLE_META[selectedId]?.catKey;
  if (selectedId === segmentId) return 0.96;
  if (selectedCat === segmentCat) return 0.48;
  return 0.2;
}

function RankedRow({
  muscle,
  isSelected,
  maxValue,
  onSelect,
  onReset,
}: {
  muscle: MuscleBreakdown;
  isSelected: boolean;
  maxValue: number;
  onSelect: (id: string) => void;
  onReset: () => void;
}) {
  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    onReset();
  }

  return (
    <button
      type="button"
      className="ta-vol__row"
      style={rowStyle(muscle, maxValue)}
      aria-pressed={isSelected}
      aria-label={`${muscle.rank}. ${muscle.label}: ${formatNumber(muscle.value)} сетов, ${formatPercent(muscle.percent)} объёма`}
      onClick={() => onSelect(muscle.id)}
      onFocus={() => onSelect(muscle.id)}
      onMouseEnter={() => onSelect(muscle.id)}
      onKeyDown={handleKeyDown}>
      <span className="ta-vol__rank">{muscle.rank}</span>
      <span className="ta-vol__row-main">
        <span className="ta-vol__row-label">{muscle.label}</span>
        <span className="ta-vol__row-bar" aria-hidden="true">
          <span />
        </span>
      </span>
      <span className="ta-vol__row-value">{formatNumber(muscle.value)}</span>
      <span className="ta-vol__row-percent">{formatPercent(muscle.percent)}</span>
    </button>
  );
}

function DetailPanel({
  muscle,
  sources,
}: {
  muscle: MuscleBreakdown | null;
  sources: readonly VolumeSource[];
}) {
  if (!muscle) {
    return (
      <aside className="ta-vol__detail is-active" aria-label="Детали объёма">
        <p className="ta-vol__empty">Недостаточно данных для распределения объёма.</p>
      </aside>
    );
  }

  return (
    <aside className="ta-vol__detail is-active" aria-label={`Источники объёма: ${muscle.label}`}>
      <div className="ta-vol__detail-head">
        <span className="ta-vol__detail-eyebrow">Источник объёма</span>
        <h3>{muscle.label}</h3>
        <p>
          {formatNumber(muscle.value)} подход / цикл · {formatPercent(muscle.percent)} общего объёма
        </p>
      </div>

      <div className="ta-vol__sources" role="list">
        {sources.map(source => (
          <div
            key={source.exerciseId}
            className="ta-vol__source"
            role="listitem"
            aria-label={`${source.label}: ${formatNumber(source.sets)} сетов`}
            style={sourceStyle(source, muscle.value)}>
            <span className="ta-vol__source-name">{source.label}</span>
            <span className="ta-vol__source-bar" aria-hidden="true">
              <span />
            </span>
            <span className="ta-vol__source-value">{formatNumber(source.sets)}</span>
          </div>
        ))}
      </div>
    </aside>
  );
}

export default function VolumeDonut() {
  const titleId = useId();
  const descId = useId();
  const breakdown = useMemo(() => computeMuscleVolumeBreakdown(), []);
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null);

  const selectedMuscle = useMemo(
    () =>
      breakdown.muscles.find(muscle => muscle.id === selectedMuscleId) ??
      breakdown.muscles[0] ??
      null,
    [breakdown.muscles, selectedMuscleId],
  );
  const selectedId = selectedMuscle?.id ?? null;
  const selectedSources = selectedId ? (breakdown.sources[selectedId] ?? []) : [];
  const maxValue = breakdown.muscles[0]?.value ?? 1;

  const {segments, categoryArcs} = useMemo(() => {
    const nextSegments: DonutSegment[] = [];
    const nextCategoryArcs: CategoryArc[] = [];
    const muscleById = new Map(breakdown.muscles.map(muscle => [muscle.id, muscle]));
    const usableDeg = 360 - CATEGORY_GAP * CAT_ORDER.length;
    let deg = -90;

    CAT_ORDER.forEach(catKey => {
      const categoryMuscles = MUSCLE_ORDER.map(muscleId => muscleById.get(muscleId)).filter(
        (muscle): muscle is MuscleBreakdown => Boolean(muscle && muscle.catKey === catKey),
      );

      const catTotal = breakdown.categories[catKey].total;
      const catDegTotal =
        breakdown.totalSets > 0 ? (catTotal / breakdown.totalSets) * usableDeg : 0;
      const muscleUsable = Math.max(
        0,
        catDegTotal - SEGMENT_GAP * Math.max(0, categoryMuscles.length - 1),
      );
      const catStart = deg;

      categoryMuscles.forEach((muscle, index) => {
        const muscleDeg = catTotal > 0 ? (muscle.value / catTotal) * muscleUsable : 0;
        nextSegments.push({
          id: muscle.id,
          value: muscle.value,
          percent: muscle.percent,
          startDeg: deg,
          endDeg: deg + muscleDeg,
          catKey,
        });
        deg += muscleDeg + (index < categoryMuscles.length - 1 ? SEGMENT_GAP : 0);
      });

      if (categoryMuscles.length > 0) {
        nextCategoryArcs.push({
          catKey,
          startDeg: catStart,
          endDeg: deg,
        });
      }

      deg += CATEGORY_GAP;
    });

    return {segments: nextSegments, categoryArcs: nextCategoryArcs};
  }, [breakdown]);

  function selectMuscle(muscleId: string) {
    setSelectedMuscleId(muscleId);
  }

  function resetSelection() {
    setSelectedMuscleId(breakdown.muscles[0]?.id ?? null);
  }

  function handleSegmentKeyDown(event: KeyboardEvent<SVGPathElement>, muscleId: string) {
    if (event.key === 'Escape') {
      event.preventDefault();
      resetSelection();
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectMuscle(muscleId);
  }

  return (
    <div className="ta-vol">
      <p className="ta-vol__lede">
        Показывает, какие мышечные группы получают больше всего рабочих подходов в базовом 2-дневном
        цикле.
      </p>

      <div className="ta-vol__grid">
        <div className="ta-vol__summary" aria-label="Баланс категорий объёма">
          {CAT_ORDER.map(catKey => {
            const category = breakdown.categories[catKey];
            return (
              <div
                key={catKey}
                className="ta-vol__summary-card"
                aria-label={`${CAT_META[catKey].label}: ${formatPercent(category.percent)}, ${formatNumber(category.total)} подходов`}
                style={{'--vol-color': CAT_META[catKey].color} as CSSProperties}>
                <span>{CAT_META[catKey].label}</span>
                <strong>{formatPercent(category.percent)}</strong>
                <em>{formatNumber(category.total)} подходов</em>
              </div>
            );
          })}
        </div>

        <div className="ta-vol__donut">
          <svg
            className="ta-vol__donut-svg"
            width="240"
            height="240"
            viewBox="0 0 240 240"
            role="group"
            aria-labelledby={`${titleId} ${descId}`}>
            <title id={titleId}>Распределение объёма по мышцам</title>
            <desc id={descId}>
              Внешнее кольцо показывает жим, тягу и ноги. Внутреннее кольцо выбирает отдельную
              мышцу.
            </desc>

            {categoryArcs.map(category => (
              <path
                key={category.catKey}
                className="ta-vol__donut-category"
                d={donutArc(
                  DONUT_CENTER,
                  DONUT_CENTER,
                  OUTER_RADIUS_OUT,
                  OUTER_RADIUS_IN,
                  category.startDeg,
                  category.endDeg,
                )}
                fill={CAT_META[category.catKey].color}
                aria-hidden="true"
              />
            ))}

            {segments.map(segment => {
              const muscle = MUSCLE_META[segment.id];
              const isSelected = selectedId === segment.id;
              return (
                <path
                  key={segment.id}
                  className="ta-vol__donut-segment"
                  d={donutArc(
                    DONUT_CENTER,
                    DONUT_CENTER,
                    INNER_RADIUS_OUT,
                    INNER_RADIUS_IN,
                    segment.startDeg,
                    segment.endDeg,
                  )}
                  fill={muscle.color}
                  opacity={getSegmentOpacity(selectedId, segment.id, segment.catKey)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  aria-label={`${muscle.label}: ${formatNumber(segment.value)} сетов, ${formatPercent(segment.percent)} объёма`}
                  style={segmentStyle(segment.id)}
                  onClick={() => selectMuscle(segment.id)}
                  onFocus={() => selectMuscle(segment.id)}
                  onMouseEnter={() => selectMuscle(segment.id)}
                  onKeyDown={event => handleSegmentKeyDown(event, segment.id)}
                />
              );
            })}

            <g aria-hidden="true">
              <text
                x={DONUT_CENTER}
                y={DONUT_CENTER - 10}
                textAnchor="middle"
                className="ta-vol__center-label">
                {selectedMuscle?.label ?? 'Объём'}
              </text>
              <text
                x={DONUT_CENTER}
                y={DONUT_CENTER + 8}
                textAnchor="middle"
                className="ta-vol__center-value">
                {selectedMuscle
                  ? formatNumber(selectedMuscle.value)
                  : formatNumber(breakdown.totalSets)}
              </text>
              <text
                x={DONUT_CENTER}
                y={DONUT_CENTER + 24}
                textAnchor="middle"
                className="ta-vol__center-meta">
                {selectedMuscle ? `${formatPercent(selectedMuscle.percent)} объёма` : 'подход / цикл'}
              </text>
            </g>
          </svg>
        </div>

        <div className="ta-vol__list" role="list" aria-label="Мышцы по объёму">
          {breakdown.muscles.map(muscle => (
            <RankedRow
              key={muscle.id}
              muscle={muscle}
              isSelected={selectedId === muscle.id}
              maxValue={maxValue}
              onSelect={selectMuscle}
              onReset={resetSelection}
            />
          ))}
        </div>

        <DetailPanel muscle={selectedMuscle} sources={selectedSources} />
      </div>
    </div>
  );
}
