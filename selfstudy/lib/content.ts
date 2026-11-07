/**
 * Загрузка контента самоучителя: selfstudy/content/*.md (копия из
 * kb-structured-2026-11-02/articles, источник не изменяется).
 * learning-path.md задаёт трек от простого к сложному: этапы = ##-заголовки,
 * темы = пронумерованные пункты с эмодзи-уровнем (🟢/🟡/🔴) и «До: п.N».
 * Темы без готовой статьи сопоставляются по токенам заголовка, иначе «скоро».
 */

import type {Block} from './md';
import {parseMarkdown} from './md';

export type LevelTag = 'basic' | 'detailed' | 'deep';

export interface ArticleMeta {
  id: string;
  title: string;
  summary: string;
  minutes?: number;
  prerequisites: string[];
  order: number;
}

export interface Article {
  meta: ArticleMeta;
  blocks: Block[];
}

export interface TrackItem {
  /** id статьи или null, если статья ещё не готова */
  id: string | null;
  title: string;
  level: LevelTag | null;
  /** номера пунктов «До: п.N» из learning-path */
  prereqNums: number[];
  /** разрешённые id статей-зависимостей */
  prereqIds: string[];
}

export interface TrackStage {
  title: string;
  items: TrackItem[];
}

const rawModules = import.meta.glob('../content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const FILE_REF_RE = /[\wа-яё-]+\.md/gi;
const STOP_TOKENS = new Set(['и', 'в', 'на', 'от', 'для', 'к', 'о', 'с', 'по', 'как', 'что']);

function tokenize(s: string): string[] {
  return (
    s
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu)
      ?.filter(t => t.length > 2 && !STOP_TOKENS.has(t)) ?? []
  );
}

/** Сопоставление темы трека со статьёй по пересечению токенов заголовков. */
function matchArticleByTitle(title: string, articles: Article[]): Article | null {
  const topic = new Set(tokenize(title));
  if (topic.size === 0) return null;
  let best: Article | null = null;
  let bestScore = 0;
  for (const a of articles) {
    const tokens = tokenize(a.meta.title);
    const hit = tokens.filter(t => topic.has(t)).length;
    const score = hit / topic.size;
    if (score > bestScore) {
      bestScore = score;
      best = a;
    }
  }
  return bestScore >= 0.6 ? best : null;
}

function firstHeading(blocks: Block[]): string | null {
  const h = blocks.find(b => b.kind === 'heading');
  return h && h.kind === 'heading' ? h.text : null;
}

function firstSummary(blocks: Block[]): string {
  const p = blocks.find(b => b.kind === 'paragraph');
  if (!p || p.kind !== 'paragraph') return '';
  const text = p.spans.map(s => s.v).join('');
  return text.length > 160 ? `${text.slice(0, 159)}…` : text;
}

function parseArticle(id: string, src: string): Article {
  const {meta, blocks: rawBlocks} = parseMarkdown(src);
  const headingTitle = firstHeading(rawBlocks);
  // Заголовок статьи уже в шапке страницы — дубликат из md убираем.
  const dropFirst = rawBlocks[0]?.kind === 'heading' && rawBlocks[0].depth === 1;
  const blocks = dropFirst ? rawBlocks.slice(1) : rawBlocks;
  const title = (meta.title ?? headingTitle ?? id)
    .replace(/^Статья:\s*/, '')
    .replace(/\s*—\s*где правда заканчивается\s*$/i, '');

  let minutes: number | undefined;
  const minutesRaw = meta.minutes ?? meta['время'];
  if (minutesRaw) {
    const n = parseInt(minutesRaw, 10);
    if (Number.isFinite(n) && n > 0) minutes = n;
  }

  const prerequisites: string[] = [];
  const prereqSources = [meta.after ?? meta.prereq ?? meta['читать-после'] ?? ''];
  for (const b of blocks.slice(0, 12)) {
    if (b.kind !== 'paragraph') continue;
    const text = b.spans.map(s => s.v).join(' ');
    if (/читать после|что читать до|зависимости/i.test(text)) prereqSources.push(text);
  }
  for (const source of prereqSources) {
    for (const m of source.matchAll(FILE_REF_RE)) {
      const ref = slugOf(m[0]);
      if (ref !== id && !prerequisites.includes(ref)) prerequisites.push(ref);
    }
  }

  return {
    meta: {
      id,
      title,
      summary: firstSummary(blocks),
      minutes,
      prerequisites,
      order: Number.parseInt(meta.order ?? '', 10) || 0,
    },
    blocks,
  };
}

function slugOf(ref: string): string {
  return ref.trim().toLowerCase().replace(/\.md$/, '');
}

function levelOfEmoji(text: string): LevelTag | null {
  if (text.includes('🟢')) return 'basic';
  if (text.includes('🟡')) return 'detailed';
  if (text.includes('🔴')) return 'deep';
  return null;
}

function itemTitle(text: string): string {
  // «2. 🟢 **Отказ, RIR и потеря скорости** (Yeti: …) → статья готова. До: п.1.»
  let t = text.replace(/^[\d.\s]*(?:🟢|🟡|🔴)\s*/u, '');
  const bold = t.match(/\*\*(.+?)\*\*/);
  if (bold) t = bold[1];
  else t = t.split(/\((Yeti|Егоров|Источник)/i)[0];
  return t
    .replace(/\s*→.*$/, '')
    .replace(/\s*\.\s*До:.*$/i, '')
    .trim();
}

function prereqNums(text: string): number[] {
  const tail = text.match(/До:\s*(.+)$/i)?.[1] ?? '';
  return [...tail.matchAll(/п\.\s*(\d+)/g)].map(m => Number.parseInt(m[1], 10));
}

function buildTrack(articles: Article[]): TrackStage[] {
  const lpRaw = rawModules['../content/learning-path.md'];
  if (!lpRaw) return [];

  const {blocks} = parseMarkdown(lpRaw);
  const stages: TrackStage[] = [];
  let current: TrackStage | null = null;

  for (const b of blocks) {
    if (b.kind === 'heading') {
      if (b.depth === 1) continue; // заголовок файла
      if (current && current.items.length > 0) stages.push(current);
      current = {title: b.text, items: []};
      continue;
    }
    if (!current || b.kind !== 'list' || !b.ordered) continue;
    for (const item of b.items) {
      const raw = item.spans.map(s => s.v).join(' ');
      const level = levelOfEmoji(raw);
      if (!level) continue; // правила трека и служебные списки — не темы
      const mdRef = raw.match(FILE_REF_RE)?.[0];
      const title = itemTitle(raw);
      const matched = mdRef
        ? (articles.find(a => a.meta.id === slugOf(mdRef)) ?? null)
        : matchArticleByTitle(title, articles);
      current.items.push({
        id: matched ? matched.meta.id : null,
        title,
        level,
        prereqNums: prereqNums(raw),
        prereqIds: [],
      });
    }
  }
  if (current && current.items.length > 0) stages.push(current);

  // Разрешение «До: п.N» → id статьи (номерация сквозная по всему треку)
  const byNum = new Map<number, TrackItem>();
  let n = 0;
  for (const stage of stages) {
    for (const item of stage.items) {
      n += 1;
      byNum.set(n, item);
    }
  }
  for (const stage of stages) {
    for (const item of stage.items) {
      item.prereqIds = [
        ...new Set(
          item.prereqNums
            .map(num => byNum.get(num))
            .filter((dep): dep is TrackItem => Boolean(dep?.id))
            .map(dep => dep.id as string),
        ),
      ];
    }
  }

  // Дедупликация: статья читается один раз
  const seen = new Set<string>();
  return stages
    .map(stage => ({
      ...stage,
      items: stage.items.filter(item => {
        if (item.id) {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
        }
        return true;
      }),
    }))
    .filter(stage => stage.items.length > 0);
}

function fallbackTrack(articles: Article[]): TrackStage[] {
  const sorted = [...articles].sort(
    (a, b) => a.meta.order - b.meta.order || a.meta.title.localeCompare(b.meta.title, 'ru'),
  );
  return [
    {
      title: 'Статьи',
      items: sorted.map(a => ({
        id: a.meta.id,
        title: a.meta.title,
        level: null,
        prereqNums: [],
        prereqIds: a.meta.prerequisites,
      })),
    },
  ];
}

const articles: Article[] = Object.entries(rawModules)
  .filter(([path]) => !/(?:learning-path|template|_)/i.test(path.replace('./content/', '')))
  .map(([path, src]) => {
    const id = (path.split('/').pop() ?? path).replace(/\.md$/, '').toLowerCase();
    return parseArticle(id, src);
  });

const built = buildTrack(articles);

export const TRACK: TrackStage[] = built.length > 0 ? built : fallbackTrack(articles);

export const ARTICLES: readonly Article[] = articles;

export function getArticle(id: string): Article | undefined {
  return articles.find(a => a.meta.id === id);
}

export function articleTitle(id: string): string {
  return getArticle(id)?.meta.title ?? id;
}
