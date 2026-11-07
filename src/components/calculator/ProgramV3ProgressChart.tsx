import {useState, type CSSProperties, type KeyboardEvent} from 'react';
import {
  useProgramV3Progress,
  type ProgramV3ChartRow,
  type ProgramV3ChartWeek,
} from '../../hooks/useProgramV3Progress';

const TIP_WIDTH = 232;
const TIP_HEIGHT = 78;
const TIP_MARGIN = 16;
const CHART_WIDTH = 800;

function formatWeight(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function weightLabel(week: ProgramV3ChartWeek): string {
  if (week.weightDisplay != null) return week.weightDisplay;
  if (week.hasWeight && week.weight != null) return `${formatWeight(week.weight)} кг`;
  if (week.loadLabel) return week.loadLabel;
  return '—';
}

function schemeLabel(week: ProgramV3ChartWeek): string {
  return week.scheme;
}

function volumeLabel(week: ProgramV3ChartWeek): string {
  return `${week.totalReps} повт`;
}

function phaseHint(week: ProgramV3ChartWeek): string {
  if (week.isTestWeek && week.weightDisplay === '?') {
    return 'введите результат в тренировке';
  }
  if (week.isPrepWeek) return week.loadLabel ?? 'подготовка';
  if (week.status === 'missing_test') return 'нужен тест раньше';
  if (week.isPreviewWeight) return 'оценка по черновому 1ПМ';
  if (week.phaseLabel === 'Разгрузка') return 'восстановление';
  if (week.phaseLabel === 'Пик') return 'пик';
  if (week.phaseLabel === 'Сила') return 'интенсификация';
  if (week.phaseLabel === 'Гипертрофия') return 'гипертрофия';
  return week.phaseLabel;
}

interface ProgramV3ProgressChartProps {
  exerciseName: string;
  rows: ProgramV3ChartRow[];
}

export default function ProgramV3ProgressChart({exerciseName, rows}: ProgramV3ProgressChartProps) {
  const {listWeeks, chartWeeks, phases, linePath, areaPath, viewBox, grid} =
    useProgramV3Progress(rows);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  const activeChart =
    activeWeek == null ? null : (chartWeeks.find(week => week.week === activeWeek) ?? null);

  const tipX = activeChart
    ? Math.max(
        TIP_MARGIN,
        Math.min(CHART_WIDTH - TIP_WIDTH - TIP_MARGIN, activeChart.x - TIP_WIDTH / 2),
      )
    : TIP_MARGIN;

  const listDesc = `${listWeeks.length} недель: рабочий вес и фаза для ${exerciseName}.`;
  const svgDesc = `${chartWeeks.length} недель на графике: интенсивность в килограммах и объём в повторениях. Подготовка (1–3) скрыта.`;

  const keyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setActiveWeek(null);
      return;
    }
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const currentIndex =
      activeWeek == null
        ? 0
        : Math.max(
            0,
            listWeeks.findIndex(week => week.week === activeWeek),
          );
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = Math.max(0, Math.min(listWeeks.length - 1, currentIndex + delta));
    setActiveWeek(listWeeks[nextIndex]?.week ?? null);
  };

  if (listWeeks.length === 0) {
    return (
      <p className="program-v3-progress__empty" role="status">
        Пока нет данных для графика. Проведи тест 1ПМ для этого упражнения — график построится.
      </p>
    );
  }

  return (
    <section
      className="program-v3-progress ta-period progression-preview"
      aria-label={`Прогрессия: ${exerciseName}`}>
      <p id="program-v3-progress-list-desc" className="progression-preview__sr-only">
        {listDesc}
      </p>

      <div className="ta-period__phases" aria-hidden="true">
        {phases.map(phase => (
          <span
            key={`${phase.label}-${phase.weeks}`}
            className="ta-period__phase"
            title={phase.title}
            style={
              {
                flexGrow: phase.weeks,
                '--phase-color': `var(${phase.colorVar})`,
                '--phase-bg': `var(${phase.tintVar})`,
              } as CSSProperties
            }>
            {phase.label}
          </span>
        ))}
      </div>

      <div className="ta-period__scroll">
        <svg
          className="ta-period__svg"
          viewBox={viewBox}
          preserveAspectRatio="none"
          role="img"
          aria-labelledby="program-v3-progress-title program-v3-progress-desc">
          <title id="program-v3-progress-title">Прогрессия по неделям</title>
          <desc id="program-v3-progress-desc">{svgDesc}</desc>
          {grid.map(y => (
            <line key={y} className="ta-period__grid" x1="56" x2="744" y1={y} y2={y} />
          ))}
          <text className="ta-period__axis" x="12" y="34">
            кг
          </text>
          <text className="ta-period__axis" x="748" y="34">
            повт
          </text>
          {linePath ? <path className="ta-period__area" d={areaPath} /> : null}
          {linePath ? <path className="ta-period__line" d={linePath} pathLength={1} /> : null}
          {chartWeeks.map((week, index) => {
            const isActive = activeWeek === week.week;
            return (
              <g key={week.week}>
                <rect
                  className={`ta-period__bar${isActive ? ' is-active' : ''}${week.isTestWeek ? ' is-test' : ''}`}
                  x={week.barX}
                  y={week.barY}
                  width="40"
                  height={week.barHeight}
                  style={{animationDelay: `${index * 60}ms`}}
                  onPointerEnter={() => setActiveWeek(week.week)}
                  onPointerLeave={() => setActiveWeek(null)}
                />
                {week.isTestWeek && week.weightDisplay === '?' ? (
                  <>
                    <circle
                      className={`ta-period__point ta-period__point--test${isActive ? ' is-active' : ''}`}
                      cx={week.x}
                      cy={week.y}
                      r="3"
                      onPointerEnter={() => setActiveWeek(week.week)}
                      onPointerLeave={() => setActiveWeek(null)}
                    />
                    <text
                      className="ta-period__test-mark"
                      x={week.x}
                      y={week.y - 10}
                      textAnchor="middle"
                      onPointerEnter={() => setActiveWeek(week.week)}
                      onPointerLeave={() => setActiveWeek(null)}>
                      ?
                    </text>
                  </>
                ) : week.hasWeight ? (
                  <circle
                    className={`ta-period__point${week.isTestWeek ? ' ta-period__point--test' : ''}${isActive ? ' is-active' : ''}`}
                    cx={week.x}
                    cy={week.y}
                    r="4"
                    onPointerEnter={() => setActiveWeek(week.week)}
                    onPointerLeave={() => setActiveWeek(null)}
                  />
                ) : (
                  <circle
                    className={`ta-period__point ta-period__point--muted${isActive ? ' is-active' : ''}`}
                    cx={week.x}
                    cy={week.y}
                    r="3"
                    onPointerEnter={() => setActiveWeek(week.week)}
                    onPointerLeave={() => setActiveWeek(null)}
                  />
                )}
                <text className="ta-period__week-label" x={week.x} y="264" textAnchor="middle">
                  {week.week}
                </text>
              </g>
            );
          })}
          {activeChart ? (
            <g className="ta-period__tip" transform={`translate(${tipX}, 14)`}>
              <line
                className="ta-period__cursor"
                x1={activeChart.x - tipX}
                x2={activeChart.x - tipX}
                y1="0"
                y2="228"
              />
              <rect width={TIP_WIDTH} height={TIP_HEIGHT} rx="10" />
              <text x="14" y="21">
                Неделя {activeChart.week} · {activeChart.phaseLabel}
              </text>
              <text x="14" y="42">
                {weightLabel(activeChart)} · {schemeLabel(activeChart)}
              </text>
              <text x="14" y="63">
                {volumeLabel(activeChart)} · {phaseHint(activeChart)}
              </text>
            </g>
          ) : null}
        </svg>
      </div>

      <div
        className="ta-period__weeks ta-period__weeks--preview"
        role="listbox"
        aria-label="Недели программы"
        aria-describedby="program-v3-progress-list-desc"
        tabIndex={0}
        onKeyDown={keyDown}>
        {listWeeks.map(week => {
          const isActive = activeWeek === week.week;
          return (
            <button
              key={week.week}
              id={`program-v3-week-${week.week}`}
              className={`ta-period-week${isActive ? ' is-active' : ''}${week.isTestWeek ? ' is-test' : ''}${week.isPrepWeek ? ' is-prep' : ''}`}
              type="button"
              role="option"
              aria-selected={isActive}
              style={
                {
                  '--phase-color': `var(${week.phaseColorVar})`,
                  '--phase-bg': `var(${week.phaseTintVar})`,
                } as CSSProperties
              }
              onFocus={() => setActiveWeek(week.week)}
              onMouseEnter={() => setActiveWeek(week.week)}
              onMouseLeave={() => setActiveWeek(null)}
              onClick={() => setActiveWeek(isActive ? null : week.week)}>
              <span>Нед {week.week}</span>
              <strong>{weightLabel(week)}</strong>
              <span>{schemeLabel(week)}</span>
              <span>{volumeLabel(week)}</span>
              <em>{week.phaseLabel}</em>
            </button>
          );
        })}
      </div>
    </section>
  );
}
