import {DiagramBlock} from './DiagramBlock';
import {DiagramFlow, type FlowNode} from './DiagramFlow';

/**
 * Схемы лекций теории: дополнение к уже написанному тексту.
 * Все числа и термины взяты из packages/shared/src/data/theory.ts — текст лекций не меняется.
 */

/* ── Глава 01 · 1.2 «Волна» — вес и объём по восьми неделям ── */

const WAVE = {
  weeks: 8,
  x0: 30,
  x1: 290,
  top: 30,
  bottom: 170,
  /** вес: нед 1–4 вверх, нед 5 откат, нед 6–8 второй пик выше */
  weight: [150, 136, 118, 96, 150, 124, 98, 72],
  /** объём: в противофазе, на неделе 5 возвращается */
  volume: [96, 106, 118, 134, 74, 108, 128, 148],
} as const;

function weekX(week: number): number {
  return WAVE.x0 + ((week - 1) * (WAVE.x1 - WAVE.x0)) / (WAVE.weeks - 1);
}

function toPoints(values: readonly number[]): string {
  return values.map((y, i) => `${weekX(i + 1)},${y}`).join(' ');
}

export function BasicsWaveDiagram() {
  const deloadX = weekX(5);
  return (
    <DiagramBlock
      title="Волна по восьми неделям"
      caption="Вес растёт к пику, объём идёт в противофазе; откат на неделе 5 выводит второй пик выше первого."
      ariaLabel="Схема волны по восьми неделям: вес растёт к пику на четвёртой неделе, неделя 5 — откат, недели 6–8 — второй пик выше первого; объём идёт в противофазе и возвращается на откате.">
      <svg viewBox="0 0 300 208" aria-hidden="true" focusable="false">
        <rect
          x={deloadX - 10}
          y={26}
          width={20}
          height={WAVE.bottom - 26}
          style={{fill: 'var(--ta-sec-01)'}}
          opacity={0.07}
        />
        <text
          x={deloadX}
          y={24}
          textAnchor="middle"
          style={{fill: 'var(--ta-text-muted)', fontSize: 11}}>
          откат
        </text>
        <line
          x1={WAVE.x0}
          y1={WAVE.bottom}
          x2={WAVE.x1}
          y2={WAVE.bottom}
          style={{stroke: 'var(--ta-border)'}}
          strokeWidth={1}
        />
        <polyline
          points={toPoints(WAVE.volume)}
          fill="none"
          style={{stroke: 'var(--ta-text-dim)'}}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points={toPoints(WAVE.weight)}
          fill="none"
          style={{stroke: 'var(--ta-sec-01)'}}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {WAVE.weight.map((y, i) => (
          <circle key={i} cx={weekX(i + 1)} cy={y} r={2.5} style={{fill: 'var(--ta-sec-01)'}} />
        ))}
        {Array.from({length: WAVE.weeks}, (_, i) => (
          <text
            key={i}
            x={weekX(i + 1)}
            y={186}
            textAnchor="middle"
            style={{fill: 'var(--ta-text-muted)', fontSize: 11}}>
            {i + 1}
          </text>
        ))}
        <text x={WAVE.x0} y={200} style={{fill: 'var(--ta-text-muted)', fontSize: 11}}>
          неделя
        </text>
        <circle cx={WAVE.x1 - 78} cy={12} r={3} style={{fill: 'var(--ta-sec-01)'}} />
        <text x={WAVE.x1 - 70} y={15} style={{fill: 'var(--ta-text-muted)', fontSize: 11}}>
          вес
        </text>
        <circle cx={WAVE.x1 - 38} cy={12} r={3} style={{fill: 'var(--ta-text-dim)'}} />
        <text x={WAVE.x1 - 30} y={15} style={{fill: 'var(--ta-text-muted)', fontSize: 11}}>
          объём
        </text>
      </svg>
    </DiagramBlock>
  );
}

/* ── Глава 02 · 2.2 «Три входа» — граф зависимостей ── */

const MTOR_LEVELS: readonly FlowNode[][] = [
  [
    {label: 'Механика', sub: '80–90% 1ПМ'},
    {label: 'Лейцин', sub: '2–3 г за приём'},
    {label: 'Энергия', sub: 'запас'},
  ],
  [{label: 'mTORC1', sub: 'интегратор', tone: 'accent'}],
  [
    {label: 'S6K1', sub: 'мощность синтеза'},
    {label: '4E-BP1', sub: 'снимает блок'},
  ],
  [{label: 'Синтез белка', sub: 'рост мышцы', tone: 'accent'}],
];

export function MtorInputsFlow() {
  return (
    <DiagramBlock
      title="Куда сходятся три входа"
      caption="Механика, лейцин и энергия сходятся в одном интеграторе: без любого из них сигнал к росту слабеет."
      ariaLabel="Граф зависимостей: механическая нагрузка, лейцин и энергия сходятся в mTORC1, который через S6K1 и 4E-BP1 запускает синтез белка и рост мышцы.">
      <DiagramFlow levels={MTOR_LEVELS} accent="var(--ta-sec-02)" />
    </DiagramBlock>
  );
}

/* ── Глава 10 · 10.3 «Модель, не календарь» — блочная модель ── */

const BLOCK_MODEL_LEVELS: readonly FlowNode[][] = [
  [{label: 'Накопление', sub: 'RPE 7 · 8–10 повт'}],
  [{label: 'Интенсификация', sub: 'RPE 7.5–9 · 5–8 повт'}],
  [{label: 'Реализация', sub: 'RPE 8.5–10 · 1–3 повт', tone: 'accent'}],
  [{label: 'Разгрузка', sub: 'RPE 5', tone: 'muted'}],
];

export function BlockModelFlow() {
  return (
    <DiagramBlock
      title="Блочная модель: фазы мезоцикла"
      caption="Фазы по 3–4 недели с одной задачей, затем неделя разгрузки."
      ariaLabel="Схема блочной модели: накопление RPE 7, интенсификация RPE 7.5–9, реализация RPE 8.5–10, затем разгрузка RPE 5.">
      <DiagramFlow levels={BLOCK_MODEL_LEVELS} accent="var(--ta-sec-10)" />
    </DiagramBlock>
  );
}
