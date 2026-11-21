export interface ChartSeries {
  name: string;
  values: number[];
}

export interface ChartBar {
  label: string;
  value: number;
  /** Своя подпись значения (например «4–6» вместо среднего). */
  valueText?: string;
  /** Диапазонный столбец: заливка от min до value (0→value, если нет min). */
  min?: number;
  /** Открытый столбец («20+»): до верха шкалы, пунктиром, со стрелкой вверх. */
  open?: boolean;
}

type DiagramChartProps = {
  /** CSS-цвет акцента главы, например 'var(--ta-sec-01)'. */
  accent: string;
  /** Полное текстовое описание для скринридеров. */
  ariaLabel: string;
  /** Подпись оси Y (ставится над графиком). */
  yLabel?: string;
  /** Подпись оси X (ставится под подписями категорий). */
  xLabel?: string;
  /** Высота viewBox области данных. */
  height?: number;
} & (
  | {
      kind: 'line';
      /** Одна-две серии; вторая рисуется приглушённым цветом. */
      series: ChartSeries[];
      xLabels: string[];
      yMin?: number;
      yMax?: number;
      /** Формат подписей значений точек (по умолчанию целое число). */
      unit?: string;
    }
  | {
      kind: 'bar';
      bars: ChartBar[];
      yMax?: number;
      unit?: string;
    }
);

const W = 280;

const TEXT_FONT = '500 9px -apple-system, BlinkMacSystemFont, system-ui, sans-serif';
const Y_TICK_FONT = '500 8.5px -apple-system, BlinkMacSystemFont, system-ui, sans-serif';

let measureCtx: CanvasRenderingContext2D | null | undefined;

function textWidth(text: string, font: string, fallbackSize: number): number {
  if (measureCtx === undefined) {
    measureCtx =
      typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  }
  if (measureCtx) {
    measureCtx.font = font;
    return measureCtx.measureText(text).width;
  }
  return text.length * fallbackSize * 0.66;
}

function fmt(v: number, unit?: string): string {
  const n = Number.isInteger(v) ? String(v) : v.toFixed(1);
  return unit ? `${n}${unit}` : n;
}

/** Перенос подписи на 2 строки по пробелу, ближайшему к середине. */
function twoLines(text: string, maxW: number, font: string, size: number): string[] {
  if (textWidth(text, font, size) <= maxW) return [text];
  const words = text.split(' ').filter(w => w !== '');
  if (words.length < 2) return [text];
  let best = [text];
  let bestD = Number.POSITIVE_INFINITY;
  for (let i = 1; i < words.length; i += 1) {
    const a = words.slice(0, i).join(' ');
    const b = words.slice(i).join(' ');
    const d = Math.abs(a.length - b.length);
    if (d < bestD) {
      bestD = d;
      best = [a, b];
    }
  }
  return best;
}

/** Красивый шаг сетки Y: 1/2/5×10^n, не меньше v. */
function niceStep(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  for (const m of [1, 2, 5, 10]) {
    if (v <= m * base + 1e-9) return m * base;
  }
  return 10 * base;
}

/**
 * Простые SVG-графики данных на токенах --ta-*: line (одна/две серии
 * с осями и подписями точек) и bar (вертикальные столбцы с подписями).
 * Без библиотек; адаптив через viewBox + width 100%; обе темы.
 */
export function DiagramChart(props: DiagramChartProps) {
  const {accent, ariaLabel, yLabel, xLabel, height = 200} = props;

  let bars: ChartBar[] = [];
  let series: ChartSeries[] = [];
  let xLabels: string[] = [];
  let nominalMax: number;
  let yMin = 0;

  if (props.kind === 'bar') {
    bars = props.bars;
    // Открытые столбцы («20+») не задают верх шкалы — ориентир их нижняя граница.
    nominalMax = Math.max(...bars.map(b => (b.open ? (b.min ?? b.value) : b.value)));
  } else {
    series = props.series;
    xLabels = props.xLabels;
    yMin = props.yMin ?? Math.min(0, ...series.flatMap(s => s.values));
    nominalMax = Math.max(...series.flatMap(s => s.values));
  }

  // Красивая шкала Y: целый шаг 1/2/5×10^n, до 5 делений, верх кратен шагу.
  const hasOpen = props.kind === 'bar' && bars.some(b => b.open);
  const step = niceStep(((props.yMax ?? nominalMax) - yMin) / 5);
  let yMax = props.yMax ?? yMin + Math.ceil((nominalMax - yMin) / step - 1e-9) * step;
  if (!props.yMax && hasOpen) yMax += step; // запас сверху для открытого столбца
  const span = yMax - yMin || 1;
  const ticks: number[] = [];
  for (let t = yMin; t <= yMax + span * 1e-9; t += step) ticks.push(+t.toFixed(6));
  const unit = props.unit;

  // Инсеты по фактической ширине подписей: ничего не обрезается.
  const yTickW = Math.max(...ticks.map(t => textWidth(fmt(t, unit), Y_TICK_FONT, 8.5)));
  const padL = Math.max(30, Math.ceil(yTickW) + 10);
  const padR = 20;
  const padT = 26; // место под подписи значений над барами/точками
  const padB = 30; // место под 2 строки подписей категорий
  const H = height;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const yOf = (v: number) => padT + innerH - ((v - yMin) / span) * innerH;

  // Категории X: bar — равные слоты-полосы, line — точки по осям.
  const categoryCount = props.kind === 'bar' ? bars.length : Math.max(1, xLabels.length);
  const lineStep = categoryCount > 1 ? innerW / (categoryCount - 1) : 0;
  const xOf = (i: number) => (categoryCount === 1 ? padL + innerW / 2 : padL + i * lineStep);
  const band = innerW / Math.max(1, categoryCount);
  const barCenter = (i: number) => padL + band * (i + 0.5);
  const barW = Math.min(40, band * 0.66);

  const seriesColors = [accent, 'var(--ta-text-dim)'];

  const legend: {name: string; color: string}[] =
    props.kind === 'line' ? series.map((s, i) => ({name: s.name, color: seriesColors[i]!})) : [];

  const legendH = legend.length > 1 ? 16 : 0;
  const xLabelH = xLabel ? 12 : 0;
  const viewBoxH = H + xLabelH + legendH;

  return (
    <svg
      viewBox={`0 0 ${W} ${viewBoxH}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}>
      {/* Сетка и ось Y */}
      {ticks.map((t, i) => (
        <g key={`tick-${i}`}>
          <line
            x1={padL}
            y1={yOf(t)}
            x2={W - padR}
            y2={yOf(t)}
            style={{stroke: 'var(--ta-border)'}}
            strokeWidth={i === 0 ? 1 : 0.5}
            strokeDasharray={i === 0 ? undefined : '2 3'}
          />
          <text
            x={padL - 5}
            y={yOf(t) + 3}
            textAnchor="end"
            style={{fill: 'var(--ta-text-muted)', fontSize: 8.5}}>
            {fmt(t, unit)}
          </text>
        </g>
      ))}

      {yLabel ? (
        <text x={0} y={9} style={{fill: 'var(--ta-text-muted)', fontSize: 9}}>
          {yLabel}
        </text>
      ) : null}

      {props.kind === 'bar'
        ? bars.map((b, i) => {
            const cx = barCenter(i);
            const y = yOf(b.open ? yMax : b.value);
            const bottom = yOf(b.min ?? yMin);
            const vText = b.valueText ?? fmt(b.value, unit);
            const lines = twoLines(b.label, band - 6, TEXT_FONT, 9);
            return (
              <g key={`bar-${i}`}>
                <rect
                  x={cx - barW / 2}
                  y={y}
                  width={barW}
                  height={Math.max(2, bottom - y)}
                  rx={b.open ? 0 : 3}
                  style={{
                    fill: `color-mix(in srgb, ${accent} 22%, var(--ta-surface-2))`,
                    stroke: accent,
                    strokeDasharray: b.open ? '3 3' : undefined,
                  }}
                  strokeWidth={1}
                />
                {b.open ? (
                  <path
                    d={`M ${cx - 4} ${y + 7} L ${cx} ${y + 1} L ${cx + 4} ${y + 7}`}
                    fill="none"
                    style={{stroke: accent}}
                    strokeWidth={1.5}
                  />
                ) : null}
                <text
                  x={cx}
                  y={y - 5}
                  textAnchor="middle"
                  style={{fill: 'var(--ta-text)', fontSize: 9, fontWeight: 600}}>
                  {vText}
                </text>
                {lines.map((l, li) => (
                  <text
                    key={li}
                    x={cx}
                    y={yOf(yMin) + 11 + li * 10}
                    textAnchor="middle"
                    style={{fill: 'var(--ta-text-muted)', fontSize: 9}}>
                    {l}
                  </text>
                ))}
              </g>
            );
          })
        : series.map((s, si) => {
            const pts = s.values.map((v, i) => `${xOf(i)},${yOf(v)}`).join(' ');
            const color = seriesColors[si]!;
            return (
              <g key={`series-${si}`}>
                <polyline
                  points={pts}
                  fill="none"
                  style={{stroke: color}}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {s.values.map((v, i) => (
                  <circle
                    key={i}
                    cx={xOf(i)}
                    cy={yOf(v)}
                    r={2.5}
                    style={{fill: color, stroke: 'var(--ta-surface)'}}
                    strokeWidth={1}
                  />
                ))}
                {si === 0 &&
                  s.values.map((v, i) => (
                    <text
                      key={i}
                      x={xOf(i)}
                      y={yOf(v) - 6}
                      textAnchor="middle"
                      style={{
                        fill: 'var(--ta-text-muted)',
                        fontSize: 8.5,
                        paintOrder: 'stroke',
                        stroke: 'var(--ta-surface)',
                        strokeWidth: 2.5,
                      }}>
                      {fmt(v, unit)}
                    </text>
                  ))}
              </g>
            );
          })}

      {props.kind === 'line'
        ? xLabels.map((lab, i) => {
            const lines = twoLines(lab, lineStep + 20, TEXT_FONT, 9);
            return lines.map((l, li) => (
              <text
                key={`${i}-${li}`}
                x={xOf(i)}
                y={yOf(yMin) + 11 + li * 10}
                textAnchor="middle"
                style={{fill: 'var(--ta-text-muted)', fontSize: 9}}>
                {l}
              </text>
            ));
          })
        : null}

      {xLabel ? (
        <text
          x={padL + innerW / 2}
          y={H + 4}
          textAnchor="middle"
          style={{fill: 'var(--ta-text-muted)', fontSize: 9}}>
          {xLabel}
        </text>
      ) : null}

      {legend.length > 1
        ? legend.map((l, i) => (
            <g key={`legend-${i}`}>
              <line
                x1={padL + i * 110}
                y1={H + xLabelH + 10}
                x2={padL + i * 110 + 14}
                y2={H + xLabelH + 10}
                style={{stroke: l.color}}
                strokeWidth={2}
              />
              <text
                x={padL + i * 110 + 19}
                y={H + xLabelH + 13}
                style={{fill: 'var(--ta-text-muted)', fontSize: 8}}>
                {l.name}
              </text>
            </g>
          ))
        : null}
    </svg>
  );
}
