import {useState, type KeyboardEvent} from 'react';
import type {JournalSession, JournalSet} from '../../types';
import {useJournalProgressChart, type JournalChartWeek} from '../../hooks/useJournalProgressChart';

function formatDateFull(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date
    .toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    .replace(' г.', '');
}

function formatDateShort(dateStr: string | null): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}`;
  }
  return dateStr;
}

function formatRestGap(days: number | null | undefined): string | null {
  if (days == null || days < 0) return null;
  if (days === 0) return '0 дн';
  return `+${days} дн`;
}

function getSessionSchemeSummary(sets: JournalSet[]): string {
  if (!sets || sets.length === 0) return '—';
  const firstSet = sets[0]!;
  const allSame = sets.every(s => s.weight === firstSet.weight && s.reps === firstSet.reps);
  if (allSame) {
    return `${sets.length} × ${firstSet.reps}`;
  }
  const repsList = sets.map(s => s.reps);
  const minReps = Math.min(...repsList);
  const maxReps = Math.max(...repsList);
  const repsStr = minReps === maxReps ? String(minReps) : `${minReps}-${maxReps}`;
  return `${sets.length} × ${repsStr}`;
}

function areaPath(weeks: JournalChartWeek[]): string {
  const points = weeks.filter(w => w.hasData && w.y != null) as {x: number; y: number}[];
  if (points.length === 0) return '';
  const base = 238; // VIEW.bottom
  const line = points
    .map(
      (point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y!.toFixed(1)}`,
    )
    .join(' ');
  return `${line} L ${points[points.length - 1].x.toFixed(1)} ${base} L ${points[0].x.toFixed(1)} ${base} Z`;
}

interface JournalProgressChartProps {
  sessions: JournalSession[];
}

const TIP_WIDTH = 232;
const TIP_HEIGHT = 78;
const TIP_MARGIN = 16;
const CHART_WIDTH = 800;

export function JournalProgressChart({sessions}: JournalProgressChartProps) {
  const model = useJournalProgressChart(sessions);
  const {journalWeeks, journalLinePath, viewBox, grid, weightTicks} = model;

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex == null ? null : journalWeeks[activeIndex];

  const hasHistory = sessions.some(s => s.sets && s.sets.length > 0);

  if (!hasHistory) {
    return (
      <div className="journal-chart-empty">
        <p className="journal-chart-empty__title">Запиши первый подход</p>
        <p className="journal-chart-empty__hint">
          Сохрани подходы с весом и повторениями — тренд построится по факту, не по программе.
        </p>
      </div>
    );
  }

  const tipX = active
    ? Math.max(TIP_MARGIN, Math.min(CHART_WIDTH - TIP_WIDTH - TIP_MARGIN, active.x - TIP_WIDTH / 2))
    : TIP_MARGIN;

  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setActiveIndex(null);
      return;
    }
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();

    const dataIndices = journalWeeks.reduce<number[]>((acc, w, idx) => {
      if (w.hasData) acc.push(idx);
      return acc;
    }, []);

    if (dataIndices.length === 0) return;

    const currentIdx = activeIndex ?? -1;
    const listIndex = dataIndices.indexOf(currentIdx);

    let nextListIndex = 0;
    if (listIndex !== -1) {
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      nextListIndex = Math.max(0, Math.min(dataIndices.length - 1, listIndex + delta));
    }

    setActiveIndex(dataIndices[nextListIndex]);
  };

  const chartAreaPath = areaPath(journalWeeks);

  return (
    <section className="ta-period" aria-label={`График прогрессии, ${journalWeeks.length} сессий`}>
      <div className="ta-period__scroll">
        <svg
          className="ta-period__svg"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-labelledby="journal-chart-title journal-chart-desc">
          <title id="journal-chart-title">График прогрессии</title>
          <desc id="journal-chart-desc">
            История сессий: пик 1ПМ в килограммах и объем в килограмм-повторениях.
          </desc>

          {/* Grid lines */}
          {grid.map(y => (
            <line key={y} className="ta-period__grid" x1="56" x2="744" y1={y} y2={y} />
          ))}

          {/* Left Axis: Weight values */}
          {weightTicks.map(tick => (
            <text key={tick.y} className="ta-period__axis" x="12" y={tick.y + 4} textAnchor="start">
              {tick.value}
            </text>
          ))}

          {/* Right Axis: label */}
          <text className="ta-period__axis" x="748" y="34" textAnchor="end">
            объём
          </text>

          {/* Area under line */}
          {chartAreaPath && <path className="ta-period__area" d={chartAreaPath} />}

          {/* Trajectory line */}
          {journalLinePath && (
            <path className="ta-period__line" d={journalLinePath} pathLength={1} />
          )}

          {/* Data points */}
          {journalWeeks.map((week, index) => {
            if (!week.hasData || week.y == null) return null;

            const isSelected = activeIndex === index;

            return (
              <g key={week.week}>
                {/* Volume Bar */}
                {week.barY != null && week.barHeight != null && (
                  <rect
                    className={`ta-period__bar${isSelected ? ' is-active' : ''}`}
                    x={week.barX}
                    y={week.barY}
                    width="40"
                    height={week.barHeight}
                    style={{animationDelay: `${index * 60}ms`}}
                    onPointerEnter={() => setActiveIndex(index)}
                    onPointerLeave={() => setActiveIndex(null)}
                  />
                )}

                {/* Point dot */}
                <circle
                  className={`ta-period__point${isSelected ? ' is-active' : ''}`}
                  cx={week.x}
                  cy={week.y}
                  r="4"
                  onPointerEnter={() => setActiveIndex(index)}
                  onPointerLeave={() => setActiveIndex(null)}
                />

                {/* Horizontal Axis: date + rest gap since previous session */}
                <text className="ta-period__week-label" x={week.x} y="258" textAnchor="middle">
                  {formatDateShort(week.date)}
                </text>
                {week.restDaysSincePrev != null ? (
                  <text
                    className="ta-period__rest-label"
                    x={week.x}
                    y="276"
                    textAnchor="middle">
                    {formatRestGap(week.restDaysSincePrev)}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* Active Tooltip Card */}
          {active && active.hasData && active.y != null && (
            <g className="ta-period__tip" transform={`translate(${tipX}, 14)`}>
              <line
                className="ta-period__cursor"
                x1={active.x - tipX}
                x2={active.x - tipX}
                y1="0"
                y2="228"
              />
              <rect width={TIP_WIDTH} height={TIP_HEIGHT} rx="10" />
              <text x="14" y="21">
                Сессия {active.week} · {formatDateShort(active.date)}
                {active.restDaysSincePrev != null
                  ? ` · ${formatRestGap(active.restDaysSincePrev)}`
                  : ''}
              </text>
              <text x="14" y="42">
                1ПМ: {active.peak?.toFixed(1)} кг · Топ: {active.topWeight?.toFixed(1)} кг
              </text>
              <text x="14" y="63">
                {active.totalReps} повт · {active.setCount} подх.
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Listbox of sessions */}
      <div
        className="ta-period__weeks"
        role="listbox"
        aria-label="История сессий"
        tabIndex={0}
        onKeyDown={keyDown}>
        {journalWeeks.reduce<React.ReactNode[]>((acc, week, index) => {
          if (week.hasData) {
            const originalIndex = index;
            const session = sessions.find(s => s.date === week.date);
            const isSelected = activeIndex === originalIndex;
            acc.push(
              <button
                key={week.week}
                id={`journal-session-${week.week}`}
                className={`ta-period-week${isSelected ? ' is-active' : ''}`}
                type="button"
                role="option"
                aria-selected={isSelected}
                onFocus={() => setActiveIndex(originalIndex)}
                onMouseEnter={() => setActiveIndex(originalIndex)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(isSelected ? null : originalIndex)}>
                <span className="ta-period-week__id">Сесс {week.week}</span>
                <strong className="ta-period-week__peak">
                  <span className="ta-period-week__kg">{week.peak?.toFixed(1) ?? '—'}</span>
                  <span className="ta-period-week__unit"> кг</span>
                  <span className="ta-period-week__tag"> · 1ПМ</span>
                </strong>
                <span className="ta-period-week__scheme">
                  {getSessionSchemeSummary(session?.sets ?? [])}
                </span>
                <span className="ta-period-week__reps">{week.totalReps ?? 0} повт</span>
                <em className="ta-period-week__date">
                  {formatDateFull(week.date)}
                  {week.restDaysSincePrev != null
                    ? ` · ${formatRestGap(week.restDaysSincePrev)}`
                    : ''}
                </em>
              </button>,
            );
          }
          return acc;
        }, [])}
      </div>
    </section>
  );
}
