/**
 * Трансляция Mermaid flowchart TD/LR в расширенную модель DiagramFlow:
 * уровни узлов + явные рёбра (с подписями |label|) + subgraph → цветовые зоны.
 * Направление TD/LR игнорируется — раскладка всегда сверху вниз.
 * Неудача парсинга → null (рисуем заглушку «Схема»).
 */

import type {FlowEdge, FlowNode, FlowZone} from '../../src/components/theory/DiagramFlow';

export interface MermaidDiagram {
  levels: FlowNode[][];
  edges: FlowEdge[];
  zones: FlowZone[];
}

const EDGE_SPLIT = /\s*(?:-{2,3}>|-\.->|={2,3}>|-{3}|={3})\s*/;
const NODE_DEF = /\b([A-Za-z0-9_]+)\s*(?:\[([^\]]*)\]|\(([^)]*)\)|\{([^}]*)\})/g;
const EDGE_ENDPOINT_RE = /\b([A-Za-z][A-Za-z0-9_]*)\b/;
const EDGE_LABEL_RE = /^\s*\|([^|]*)\|/;
const SUBGRAPH_RE = /^subgraph\s+(?:([\wа-яё]+)\s+\[([^\]]*)\]|\[([^\]]*)\]|(.+?))\s*$/i;

function cleanLabel(raw: string | undefined, id: string): string {
  const base = (raw ?? '')
    .replace(/\\n/g, ' ')
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/["`]/g, '');
  const label = base.trim();
  if (!label) return id;
  // Потолок только от патологий: перенос строк и ширина узлов — на DiagramFlow.
  return label.length > 80 ? `${label.slice(0, 79)}…` : label;
}

/** Уровни узлов + рёбра (с подписями) + зоны (subgraph) для DiagramFlow. */
export function parseMermaidDiagram(src: string): MermaidDiagram | null {
  const lines = src.split('\n');
  const head = lines[0]?.match(/^\s*(?:flowchart|graph)\s+(TD|TB|LR|BT|RL)\b/i);
  if (!head) return null;

  const labels = new Map<string, string>();

  // 0. Subgraph-блоки → зоны: собираем id узлов внутри каждого блока.
  const zones: FlowZone[] = [];
  let zoneNodes: string[] | null = null;
  let zoneTitle = '';

  // 1. Определения узлов: только явные A[label] / A{label} / A(label)
  for (const lineRaw of lines.slice(1)) {
    const line = lineRaw.trim();
    const sub = line.match(SUBGRAPH_RE);
    if (sub) {
      zoneNodes = [];
      zoneTitle = (sub[2] ?? sub[3] ?? sub[4] ?? '').trim();
      continue;
    }
    if (/^end\b/i.test(line)) {
      if (zoneNodes && zoneNodes.length >= 1 && zoneTitle) {
        zones.push({title: zoneTitle, nodes: zoneNodes});
      }
      zoneNodes = null;
      zoneTitle = '';
      continue;
    }
    if (line === '' || /^%%/.test(line)) continue;
    if (/^(classDef|class|style|linkStyle|direction)\b/i.test(line)) continue;
    // Голая ссылка на узел внутри subgraph (P1 без скобок).
    if (zoneNodes) {
      const bare = line.match(/^([A-Za-z][A-Za-z0-9_]*)$/);
      if (bare && labels.has(bare[1]!) && !zoneNodes.includes(bare[1]!)) {
        zoneNodes.push(bare[1]!);
        continue;
      }
    }
    for (const m of line.matchAll(NODE_DEF)) {
      const id = m[1]!;
      if (!labels.has(id)) {
        labels.set(id, cleanLabel(m[2] ?? m[3] ?? m[4], id));
        if (zoneNodes) zoneNodes.push(id);
      } else if (zoneNodes && !zoneNodes.includes(id)) {
        zoneNodes.push(id);
      }
    }
  }
  if (zoneNodes && zoneNodes.length >= 1 && zoneTitle) {
    zones.push({title: zoneTitle, nodes: zoneNodes});
  }
  if (labels.size === 0) return null;

  // 2. Рёбра: между известными узлами; подпись |...| после стрелки сохраняем.
  const edges: FlowEdge[] = [];
  for (const lineRaw of lines.slice(1)) {
    const line = lineRaw.trim();
    if (line === '' || /^%%/.test(line)) continue;
    if (/^(subgraph|end|classDef|class|style|linkStyle|direction)\b/i.test(line)) {
      continue;
    }
    if (!EDGE_SPLIT.test(line)) continue;
    EDGE_SPLIT.lastIndex = 0;
    const parts = line.split(EDGE_SPLIT).filter(p => p.trim() !== '');
    for (let k = 0; k + 1 < parts.length; k += 1) {
      let tail = parts[k + 1]!;
      let edgeLabel: string | undefined;
      const lm = tail.match(EDGE_LABEL_RE);
      if (lm) {
        edgeLabel = lm[1]!.trim() || undefined;
        tail = tail.replace(EDGE_LABEL_RE, ' ');
      }
      const from = parts[k]!.replace(/\|[^|]*\|/g, ' ').match(EDGE_ENDPOINT_RE)?.[1];
      const to = tail.match(EDGE_ENDPOINT_RE)?.[1];
      if (from && to && from !== to && labels.has(from) && labels.has(to)) {
        edges.push({from, to, label: edgeLabel});
      }
    }
  }

  // 3. Глубины: корни без входящих рёбер = 0; рёбра удлиняют уровень.
  const depth = new Map<string, number>();
  for (const id of labels.keys()) depth.set(id, 0);
  for (let pass = 0; pass < 16; pass += 1) {
    let changed = false;
    for (const {from, to} of edges) {
      const next = (depth.get(from) ?? 0) + 1;
      if (next > (depth.get(to) ?? 0) && next < 16) {
        depth.set(to, next);
        changed = true;
      }
    }
    if (!changed) break;
  }

  const levels: FlowNode[][] = [];
  for (const [id, d] of depth) {
    while (levels.length <= d) levels.push([]);
    levels[d].push({id, label: labels.get(id) ?? id});
  }
  // Длинные подписи не урезаем: DiagramFlow сам измеряет текст,
  // переносит строки и расширяет узлы/viewBox под контент.
  return {levels: levels.filter(level => level.length > 0), edges, zones};
}

/** Уровни узлов сверху вниз для DiagramFlow (совместимый старый экспорт). */
export function parseMermaidFlow(src: string): FlowNode[][] | null {
  const diagram = parseMermaidDiagram(src);
  return diagram ? diagram.levels : null;
}
