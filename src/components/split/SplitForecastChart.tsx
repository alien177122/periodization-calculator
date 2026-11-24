import {useState, type KeyboardEvent} from 'react';
import {useSplitForecastChart} from '../../hooks/useSplitForecastChart.ts';
import type {CustomSplit, SavedExercise} from '../../types';
import '../../styles/components/split/split-forecast-chart.css';

interface SplitForecastChartProps {
  split: CustomSplit;
  savedExercises: SavedExercise[];
}

const TIP_WIDTH = 232;
const TIP_HEIGHT = 56;
const TIP_MARGIN = 16;
const CHART_WIDTH = 800;

function formatTonnage(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} т`;
  return `${Math.round(value)} кг·повт`;
}

/** Compact ticks for the left scale — unit lives in the «тоннаж» caption. */
function formatAxisTonnage(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} т`;
  return String(Math.round(value));
}

export function SplitForecastChart({split, savedExercises}: SplitForecastChartProps) {
  const model = useSplitForecastChart(split, savedExercises);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!model.hasExercises) {
    return (
      <p className="split-forecast-chart__empty" role="status">
        Нет упражнений для графика.
      </p>
    );
  }

  const active = activeIndex == null ? null : model.weeks[activeIndex];
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
    const current = activeIndex ?? 0;
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    setActiveIndex(Math.max(0, Math.min(model.weeks.length - 1, current + delta)));
  };

  return (
    <section
      className="split-forecast-chart ta-period"
      aria-label="Прогноз тоннажа сплита, 8 недель">
      <p className="split-forecast-chart__hint">
        Тоннаж = кг × повторения × подходы (сумма по всем упражнениям недели).
      </p>
      <div className="ta-period__scroll">
        <svg
          className="ta-period__svg"
          viewBox={model.viewBox}
          preserveAspectRatio="none"
          role="img"
          aria-labelledby="split-forecast-title split-forecast-desc">
          <title id="split-forecast-title">Прогноз тоннажа сплита</title>
          <desc id="split-forecast-desc">
            8 недель: суммарный тоннаж столбиками. Тоннаж = кг × повторения × подходы.
          </desc>
          {model.grid.map(y => (
            <line key={y} className="ta-period__grid" x1="56" x2="744" y1={y} y2={y} />
          ))}
          <text className="ta-period__axis" x="12" y="16">
            тоннаж
          </text>
          <text className="ta-period__axis" x="12" y="32">
            {formatAxisTonnage(model.maxTonnage)}
          </text>
          <text className="ta-period__axis" x="12" y="242">
            {formatAxisTonnage(model.minTonnage)}
          </text>
          {model.areaPath ? <path className="ta-period__area" d={model.areaPath} /> : null}
          {model.linePath ? (
            <path className="ta-period__line" d={model.linePath} pathLength={1} />
          ) : null}
          {model.weeks.map((week, index) => (
            <g key={week.week}>
              <rect
                className={`ta-period__bar${activeIndex === index ? ' is-active' : ''}`}
                x={week.barX}
                y={week.barY}
                width="40"
                height={week.barHeight}
                style={{animationDelay: `${index * 60}ms`}}
                onPointerEnter={() => setActiveIndex(index)}
                onPointerLeave={() => setActiveIndex(null)}
              />
              <circle
                className={`ta-period__point${activeIndex === index ? ' is-active' : ''}`}
                cx={week.x}
                cy={week.y}
                r="4"
                onPointerEnter={() => setActiveIndex(index)}
                onPointerLeave={() => setActiveIndex(null)}
              />
              <text className="ta-period__week-label" x={week.x} y="264" textAnchor="middle">
                {week.week}
              </text>
            </g>
          ))}
          {active ? (
            <g className="ta-period__tip" transform={`translate(${tipX}, 14)`}>
              <line
                className="ta-period__cursor"
                x1={active.x - tipX}
                x2={active.x - tipX}
                y1="0"
                y2="228"
              />
              <rect width={TIP_WIDTH} height={TIP_HEIGHT} rx="8" />
              <text x="14" y="21">
                Неделя {active.week}
              </text>
              <text x="14" y="42">
                Тоннаж {formatTonnage(active.tonnage)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
      <div
        className="ta-period__weeks"
        role="listbox"
        aria-label="Недели прогноза"
        tabIndex={0}
        onKeyDown={keyDown}>
        {model.weeks.map((week, index) => (
          <button
            key={week.week}
            className={`ta-period-week${activeIndex === index ? ' is-active' : ''}`}
            type="button"
            role="option"
            aria-selected={activeIndex === index}
            onFocus={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}>
            <span>Нед {week.week}</span>
            <strong>{formatTonnage(week.tonnage)}</strong>
            <em>тоннаж</em>
          </button>
        ))}
      </div>
    </section>
  );
}
