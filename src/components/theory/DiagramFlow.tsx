import {useId} from 'react';

export interface FlowNode {
  /** Стабильный ключ узла для edges/zones (для простой схемы не нужен). */
  id?: string;
  /** Короткий главный ярлык узла. */
  label: string;
  /** Мелкая вторая строка: число, роль, уточнение. */
  sub?: string;
  tone?: 'accent' | 'muted' | 'warn';
}

/** Рёбро: соседние уровни соединяются ортогонально, остальные — кривой сбоку. */
export interface FlowEdge {
  from: string;
  to: string;
  /** Подпись у стрелки (с фоном-подложкой). */
  label?: string;
  /** Принудительно рисовать обходной кривой сбоку. */
  side?: boolean;
  tone?: 'accent' | 'warn';
}

/** Цветовая зона-плашка за группой узлов с заголовком. */
export interface FlowZone {
  title: string;
  /** id узлов зоны (узлы могут быть в разных уровнях). */
  nodes: string[];
  tone?: 'accent' | 'muted' | 'warn';
}

/** Элемент легенды под схемой. */
export interface LegendItem {
  label: string;
  kind: 'node' | 'accent' | 'muted' | 'warn' | 'edge';
}

export interface DiagramFlowProps {
  /** Уровни сверху вниз; узлы внутри уровня раскладываются в ряд. */
  levels: readonly FlowNode[][];
  /** CSS-цвет акцента главы, например 'var(--ta-sec-02)'. */
  accent: string;
  /** Явные рёбра (id узлов). Без пропса — автоматические между соседними уровнями. */
  edges?: readonly FlowEdge[];
  /** Зоны-плашки за группами узлов. */
  zones?: readonly FlowZone[];
  /** Легенда под схемой. */
  legend?: readonly LegendItem[];
}

/** Минимальная ширина viewBox: маленькие схемы выглядят как раньше. */
const MIN_W = 300;
/** Потолок ширины viewBox: на 390px подписи остаются ≥ ~11px. */
const MAX_W = 340;
const SIDE = 6;
const GAP = 8;
const ROW_GAP = 34;
const LINE_H = 16;
const SUB_H = 14;
const PAD = 10;
/** Горизонтальный внутренний отступ текста в узле. */
const TEXT_PAD = 9;
const LABEL_SIZE = 12;
const SUB_SIZE = 10.5;
const EDGE_LABEL_SIZE = 9.5;
const EDGE_LABEL_PAD = 4;
const ZONE_PAD = 6;
const ZONE_TITLE_H = 16;
const LANE_BASE = 14;
const LANE_GAP = 12;
const LEGEND_SIZE = 10;
const LEGEND_ROW = 16;

const LABEL_FONT = `600 ${LABEL_SIZE}px -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
const SUB_FONT = `${SUB_SIZE}px -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
const EDGE_LABEL_FONT = `500 ${EDGE_LABEL_SIZE}px -apple-system, BlinkMacSystemFont, system-ui, sans-serif`;
const WARN = 'var(--ta-warn, #d97706)';

let measureCtx: CanvasRenderingContext2D | null | undefined;

/** Ширина текста: canvas в браузере, консервативная оценка в остальном (SSR/тесты). */
function textWidth(text: string, font: string, fallbackSize: number): number {
  if (measureCtx === undefined) {
    measureCtx =
      typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  }
  if (measureCtx) {
    measureCtx.font = font;
    return measureCtx.measureText(text).width;
  }
  // ~0.62em на символ для системного шрифта с кириллицей; с запасом вверх.
  return text.length * fallbackSize * 0.66;
}

const VOWELS = new Set('аеёиоуыэюяaeiouy');

/**
 * Разбивка длинного слова (без пробелов) на две части по слоговому принципу:
 * перенос после гласной перед согласной, ближайший к середине слова.
 */
function splitLongWord(word: string): [string, string] | null {
  if (word.length < 11) return null;
  const mid = word.length / 2;
  let bestI = -1;
  let bestD = Number.POSITIVE_INFINITY;
  for (let i = 2; i < word.length - 3; i += 1) {
    if (VOWELS.has(word[i - 1]!.toLowerCase()) && !VOWELS.has(word[i]!.toLowerCase())) {
      const d = Math.abs(i - mid);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    }
  }
  if (bestI < 0) return null;
  return [`${word.slice(0, bestI)}-`, word.slice(bestI)];
}

/**
 * Перенос подписи на несколько строк: жадная раскладка слов под целевую
 * ширину строки; слишком длинные слова переносятся по слогам.
 */
function layoutLines(text: string, font: string, size: number, target: number): string[] {
  if (textWidth(text, font, size) <= target) return [text];
  const raw = text.split(' ').filter(w => w !== '');
  const words = raw.flatMap(w =>
    textWidth(w, font, size) > target ? (splitLongWord(w) ?? [w]) : [w],
  );
  if (words.length < 2) return [text];
  const lines: string[] = [];
  let cur = words[0]!;
  for (let i = 1; i < words.length; i += 1) {
    const cand = `${cur} ${words[i]}`;
    if (textWidth(cand, font, size) > target) {
      lines.push(cur);
      cur = words[i]!;
    } else {
      cur = cand;
    }
  }
  lines.push(cur);
  return lines;
}

interface LaidNode {
  node: FlowNode;
  lines: string[];
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Точка на кубической кривой Безье (t = 0.5). */
function bezierMid(p0: number, p1: number, p2: number, p3: number): number {
  return (p0 + 3 * p1 + 3 * p2 + p3) / 8;
}

/**
 * Граф зависимостей понятий: вертикальные уровни узлов, ортогональные стрелки.
 * Поддерживает подписи рёбер (с фоном-подложкой), зоны-плашки с заголовками,
 * обходные кривые для перекрёстных/обратных связей, узлы типов
 * обычный/акцент/приглушённый/предупреждение и легенду под схемой.
 * Ширина узлов и viewBox подстраивается под фактический текст: длинные
 * подписи переносятся на несколько строк, ничего не обрезается.
 */
export function DiagramFlow({levels, accent, edges, zones, legend}: DiagramFlowProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const markerId = `df-arrow-${uid}`;
  const markerAccentId = `df-arrow-acc-${uid}`;

  // 1. Контент-минимум ширины каждого узла: целевая ширина строки выводится
  // из потолка MAX_W, чтобы многоколончатые ряды не распирали viewBox.
  const rowsTmp: {node: FlowNode; lines: string[]; width: number}[][] = levels.map(row => {
    const target = Math.max(
      64,
      (MAX_W - SIDE * 2 - GAP * (row.length - 1)) / row.length - TEXT_PAD * 2,
    );
    return row.map(node => {
      const lines = layoutLines(node.label, LABEL_FONT, LABEL_SIZE, target);
      const labelW = Math.max(...lines.map(l => textWidth(l, LABEL_FONT, LABEL_SIZE)));
      const subW = node.sub ? textWidth(node.sub, SUB_FONT, SUB_SIZE) : 0;
      const width = Math.ceil(Math.max(labelW, subW)) + TEXT_PAD * 2;
      return {node, lines, width};
    });
  });

  // 2. Плотные уровни (4+ колонок) при явных рёбрах переносятся на несколько
  // визуальных рядов — вместо распирания viewBox по ширине.
  interface VRow {
    items: {node: FlowNode; lines: string[]; width: number}[];
    split: boolean;
  }
  const visualRows: VRow[] = [];
  levels.forEach((row, level) => {
    const items = rowsTmp[level]!;
    const canSplit = !!edges && edges.length > 0 && row.every(n => n.id) && row.length >= 4;
    const natural = items.reduce((s, nd) => s + nd.width, 0) + GAP * (items.length - 1);
    if (canSplit && natural > MAX_W - SIDE * 2) {
      const limit = MAX_W - SIDE * 2;
      let chunk: typeof items = [];
      let acc = 0;
      for (const it of items) {
        const add = chunk.length === 0 ? it.width : GAP + it.width;
        if (acc + add > limit && chunk.length > 0) {
          visualRows.push({items: chunk, split: true});
          chunk = [];
          acc = 0;
        }
        chunk.push(it);
        acc += chunk.length === 1 ? it.width : GAP + it.width;
      }
      if (chunk.length > 0) visualRows.push({items: chunk, split: true});
    } else {
      visualRows.push({items, split: false});
    }
  });

  const minRowW = visualRows.map(row => {
    const w = row.items.reduce((sum, nd) => sum + nd.width, 0);
    return w + GAP * (row.items.length - 1);
  });
  let contentW = Math.max(MIN_W, ...minRowW.map(w => w + SIDE * 2));

  const rowHeights = visualRows.map(row =>
    Math.max(
      ...row.items.map(nd => PAD * 2 + nd.lines.length * LINE_H + (nd.node.sub ? SUB_H : 0)),
    ),
  );
  // Зоны добавляют плашку с заголовком над своим верхним рядом.
  const hasZones = (zones?.length ?? 0) > 0;
  const topExtra = hasZones ? ZONE_TITLE_H : 0;
  const tops: number[] = [];
  let cursor = PAD + topExtra;
  for (const height of rowHeights) {
    tops.push(cursor);
    cursor += height + ROW_GAP;
  }
  let totalHeight = cursor - ROW_GAP + PAD;

  const rects: LaidNode[][] = visualRows.map((row, r) => {
    // Неразделённые ряды делят ширину поровну; переносные — по контенту.
    const even = row.split
      ? 0
      : (contentW - SIDE * 2 - GAP * (row.items.length - 1)) / row.items.length;
    let x = SIDE;
    return row.items.map(nd => {
      const w = row.split ? nd.width : Math.max(nd.width, even);
      const rect: LaidNode = {
        node: nd.node,
        lines: nd.lines,
        x,
        y: tops[r],
        w,
        h: rowHeights[r],
      };
      x += w + GAP;
      return rect;
    });
  });

  // 3. Карта id → узел для явных рёбер и зон.
  const byId = new Map<string, LaidNode>();
  rects.forEach(row => {
    row.forEach(nd => {
      if (nd.node.id) byId.set(nd.node.id, nd);
    });
  });

  // 4. Рёбра: ортогональные между соседними уровнями + обходные кривые сбоку.
  interface DrawnEdge {
    d: string;
    tone?: 'accent' | 'warn';
    label?: {x: number; y: number; text: string; w: number};
  }
  const drawn: DrawnEdge[] = [];
  let laneCursor = 0;

  /** Размещение подписи без наложений: перебираем вертикальные сдвиги. */
  const placedLabels: {x1: number; x2: number; y1: number; y2: number}[] = [];
  const placeLabel = (x: number, w: number, y0: number) => {
    const x1 = x - w / 2 - EDGE_LABEL_PAD;
    const x2 = x + w / 2 + EDGE_LABEL_PAD;
    for (const dy of [0, -13, 13, -26, 26]) {
      const y1 = y0 + dy - 8;
      const y2 = y0 + dy + 6;
      if (!placedLabels.some(p => x1 < p.x2 && x2 > p.x1 && y1 < p.y2 && y2 > p.y1)) {
        placedLabels.push({x1, x2, y1, y2});
        return y0 + dy;
      }
    }
    placedLabels.push({x1, x2, y1: y0 - 8, y2: y0 + 6});
    return y0;
  };

  const addOrtho = (a: LaidNode, b: LaidNode, label?: string, tone?: FlowEdge['tone']) => {
    const ax = a.x + a.w / 2;
    const bx = b.x + b.w / 2;
    const aBottom = a.y + a.h;
    const bTop = b.y;
    const midY = (aBottom + bTop) / 2;
    const d =
      ax === bx
        ? `M ${ax} ${aBottom} L ${ax} ${bTop - 1}`
        : `M ${ax} ${aBottom} V ${midY} H ${bx} V ${bTop - 1}`;
    let lab;
    if (label) {
      const w = textWidth(label, EDGE_LABEL_FONT, EDGE_LABEL_SIZE);
      const lx = ax === bx ? ax + 8 : (ax + bx) / 2;
      // Подпись над линией: не залезает на заголовки зон под нижним узлом.
      const ly = ax === bx ? midY : midY - 9;
      lab = {x: lx, y: placeLabel(lx, w, ly), text: label, w};
    }
    drawn.push({d, label: lab, tone});
  };

  const addSideCurve = (a: LaidNode, b: LaidNode, label?: string, tone?: FlowEdge['tone']) => {
    const sx = a.x + a.w;
    const sy = a.y + a.h / 2;
    const tx = b.x + b.w;
    const ty = b.y + b.h / 2;
    const lane = Math.max(sx, tx) + LANE_BASE + laneCursor * LANE_GAP;
    laneCursor += 1;
    contentW = Math.max(contentW, lane + 6);
    const d = `M ${sx} ${sy} C ${lane} ${sy}, ${lane} ${ty}, ${tx} ${ty}`;
    let lab;
    if (label) {
      const w = textWidth(label, EDGE_LABEL_FONT, EDGE_LABEL_SIZE);
      const mx = bezierMid(sx, lane, lane, tx);
      const my = bezierMid(sy, sy, ty, ty);
      lab = {x: mx, y: placeLabel(mx, w, my), text: label, w};
    }
    drawn.push({d, label: lab, tone});
  };

  if (edges && edges.length > 0) {
    for (const e of edges) {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b) continue;
      const rowDiff =
        rects.findIndex(row => row.includes(b)) - rects.findIndex(row => row.includes(a));
      const downwardAdjacent = rowDiff === 1 && b.y > a.y;
      if (downwardAdjacent && !e.side) {
        addOrtho(a, b, e.label, e.tone);
      } else {
        addSideCurve(a, b, e.label, e.tone);
      }
    }
  } else {
    for (let r = 0; r < levels.length - 1; r += 1) {
      const from = rects[r];
      const to = rects[r + 1];
      const pairs: [number, number][] =
        to.length === 1
          ? from.map((_, i) => [i, 0])
          : from.length === 1
            ? to.map((_, i) => [0, i])
            : from.map((_, i) => [i, Math.min(i, to.length - 1)]);
      for (const [ai, bi] of pairs) addOrtho(from[ai]!, to[bi]!);
    }
  }

  // 5. Зоны: плашки за узлами (группировка по рядам, заголовок над верхним).
  interface ZoneRect {
    x: number;
    y: number;
    w: number;
    h: number;
    title?: string;
    tone: NonNullable<FlowZone['tone']>;
  }
  const zoneRects: ZoneRect[] = [];
  for (const zone of zones ?? []) {
    const members = zone.nodes.map(id => byId.get(id)).filter((n): n is LaidNode => !!n);
    if (members.length === 0) continue;
    const rowOf = (n: LaidNode) => rects.findIndex(row => row.includes(n));
    const rowsInvolved = [...new Set(members.map(rowOf))].sort((a, b) => a - b);
    const minX = Math.min(...members.map(n => n.x));
    const maxX = Math.max(...members.map(n => n.x + n.w));
    if (rowsInvolved.length === 1) {
      const r = rowsInvolved[0]!;
      zoneRects.push({
        x: minX - ZONE_PAD,
        y: tops[r] - ZONE_TITLE_H,
        w: maxX - minX + ZONE_PAD * 2,
        h: rowHeights[r] + ZONE_TITLE_H + 6,
        title: zone.title,
        tone: zone.tone ?? 'accent',
      });
    } else {
      // Зона на нескольких уровнях: одна общая плашка от верха до низа.
      const first = rowsInvolved[0]!;
      const last = rowsInvolved[rowsInvolved.length - 1]!;
      zoneRects.push({
        x: minX - ZONE_PAD,
        y: tops[first] - ZONE_TITLE_H,
        w: maxX - minX + ZONE_PAD * 2,
        h: tops[last] + rowHeights[last] - (tops[first] - ZONE_TITLE_H) + 6,
        title: zone.title,
        tone: zone.tone ?? 'accent',
      });
    }
  }

  // 6. Легенда под схемой.
  const legendRows: {x: number; y: number; item: LegendItem}[][] = [];
  if (legend && legend.length > 0) {
    let row: {x: number; y: number; item: LegendItem}[] = [];
    let x = SIDE;
    const y = totalHeight + 10;
    for (const item of legend) {
      const w = 12 + 5 + textWidth(item.label, SUB_FONT, SUB_SIZE) + 14;
      if (x + w > contentW - SIDE && row.length > 0) {
        legendRows.push(row);
        row = [];
        x = SIDE;
      }
      row.push({x, y, item});
      x += w;
    }
    if (row.length > 0) legendRows.push(row);
    totalHeight = y + legendRows.length * LEGEND_ROW + 2;
  }

  const nodeStyle = (node: FlowNode) => {
    const isAccent = node.tone === 'accent';
    const isMuted = node.tone === 'muted';
    const isWarn = node.tone === 'warn';
    return {
      fill: isAccent
        ? `color-mix(in srgb, ${accent} 14%, var(--ta-surface-2))`
        : isWarn
          ? `color-mix(in srgb, ${WARN} 10%, var(--ta-surface-2))`
          : 'var(--ta-surface-2)',
      stroke: isAccent
        ? accent
        : isWarn
          ? WARN
          : isMuted
            ? 'var(--ta-border)'
            : 'var(--ta-border-strong)',
      text: isMuted ? 'var(--ta-text-muted)' : isAccent ? accent : isWarn ? WARN : 'var(--ta-text)',
    };
  };

  const zoneStyle = (tone: ZoneRect['tone']) => ({
    fill:
      tone === 'accent'
        ? `color-mix(in srgb, ${accent} 8%, transparent)`
        : tone === 'warn'
          ? `color-mix(in srgb, ${WARN} 7%, transparent)`
          : 'transparent',
    stroke:
      tone === 'accent'
        ? `color-mix(in srgb, ${accent} 35%, transparent)`
        : tone === 'warn'
          ? `color-mix(in srgb, ${WARN} 40%, transparent)`
          : 'var(--ta-border)',
    title: tone === 'accent' ? accent : tone === 'warn' ? WARN : 'var(--ta-text-muted)',
  });

  return (
    <svg
      viewBox={`0 0 ${contentW} ${totalHeight}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false">
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse">
          <path d="M0 1 L7 4 L0 7 Z" style={{fill: 'var(--ta-text-dim)'}} />
        </marker>
        <marker
          id={markerAccentId}
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse">
          <path d="M0 1 L7 4 L0 7 Z" style={{fill: 'var(--ta-text)'}} />
        </marker>
      </defs>

      {zoneRects.map((z, i) => {
        const s = zoneStyle(z.tone);
        return (
          <g key={`zone-${i}`}>
            <rect
              x={z.x}
              y={z.y}
              width={z.w}
              height={z.h}
              rx={8}
              style={{fill: s.fill, stroke: s.stroke}}
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {z.title ? (
              <text
                x={z.x + 4}
                y={z.y + 11}
                style={{fill: s.title, fontSize: 10, fontWeight: 600, letterSpacing: 0.3}}>
                {z.title}
              </text>
            ) : null}
          </g>
        );
      })}

      {drawn.map((e, i) => (
        <path
          key={`edge-${i}`}
          d={e.d}
          fill="none"
          style={{
            stroke: e.tone === 'accent' ? accent : e.tone === 'warn' ? WARN : 'var(--ta-text-dim)',
          }}
          strokeWidth={1.5}
          markerEnd={`url(#${e.tone ? markerAccentId : markerId})`}
        />
      ))}

      {drawn.map((e, i) =>
        e.label ? (
          <g key={`elabel-${i}`}>
            <rect
              x={e.label.x - e.label.w / 2 - EDGE_LABEL_PAD}
              y={e.label.y - 11}
              width={e.label.w + EDGE_LABEL_PAD * 2}
              height={EDGE_LABEL_SIZE + 5}
              rx={3}
              style={{fill: 'var(--ta-surface)'}}
            />
            <text
              x={e.label.x}
              y={e.label.y - 2}
              textAnchor="middle"
              style={{fill: 'var(--ta-text-muted)', fontSize: EDGE_LABEL_SIZE}}>
              {e.label.text}
            </text>
          </g>
        ) : null,
      )}

      {rects.map((row, r) =>
        row.map(nd => {
          const s = nodeStyle(nd.node);
          const cx = nd.x + nd.w / 2;
          return (
            <g key={`${r}-${nd.node.id ?? nd.node.label}`}>
              <rect
                x={nd.x}
                y={nd.y}
                width={nd.w}
                height={nd.h}
                rx={10}
                style={{fill: s.fill, stroke: s.stroke}}
                strokeWidth={1}
              />
              <text
                x={cx}
                y={nd.y + PAD + 12}
                textAnchor="middle"
                style={{fill: s.text, fontSize: LABEL_SIZE, fontWeight: 600}}>
                {nd.lines.map((line, li) => (
                  <tspan key={li} x={cx} dy={li === 0 ? 0 : LINE_H}>
                    {line}
                  </tspan>
                ))}
              </text>
              {nd.node.sub ? (
                <text
                  x={cx}
                  y={nd.y + PAD + nd.lines.length * LINE_H + SUB_H - 2}
                  textAnchor="middle"
                  style={{fill: 'var(--ta-text-muted)', fontSize: SUB_SIZE}}>
                  {nd.node.sub}
                </text>
              ) : null}
            </g>
          );
        }),
      )}

      {legendRows.map((row, ri) =>
        row.map(({x, y, item}, ii) => {
          const yy = y + ri * LEGEND_ROW;
          const fill =
            item.kind === 'accent'
              ? `color-mix(in srgb, ${accent} 14%, var(--ta-surface-2))`
              : item.kind === 'warn'
                ? `color-mix(in srgb, ${WARN} 10%, var(--ta-surface-2))`
                : 'var(--ta-surface-2)';
          const stroke =
            item.kind === 'accent'
              ? accent
              : item.kind === 'warn'
                ? WARN
                : item.kind === 'muted'
                  ? 'var(--ta-border)'
                  : 'var(--ta-border-strong)';
          return (
            <g key={`leg-${ri}-${ii}`}>
              {item.kind === 'edge' ? (
                <line
                  x1={x}
                  y1={yy + 6}
                  x2={x + 12}
                  y2={yy + 6}
                  style={{stroke: 'var(--ta-text-dim)'}}
                  strokeWidth={1.5}
                />
              ) : (
                <rect
                  x={x}
                  y={yy}
                  width={12}
                  height={12}
                  rx={3}
                  style={{fill, stroke}}
                  strokeWidth={1}
                />
              )}
              <text
                x={x + 17}
                y={yy + 10}
                style={{fill: 'var(--ta-text-muted)', fontSize: LEGEND_SIZE}}>
                {item.label}
              </text>
            </g>
          );
        }),
      )}
    </svg>
  );
}
