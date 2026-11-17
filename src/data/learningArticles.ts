import {parseMarkdown, type Block} from '../../selfstudy/lib/md';
import type {Article} from '../../selfstudy/lib/content';

/**
 * Ленивая загрузка статей самоучителя для вкладки «Теория» (L3).
 *
 * Раньше TheoryTab тянул весь markdown-корпус (15 статей) в один чанк.
 * Здесь glob без eager: каждая статья — отдельный async-чанк, который
 * запрашивается только при открытии шага маршрута.
 */
const rawModules = import.meta.glob('../../selfstudy/content/*.md', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

const loaders = new Map<string, () => Promise<string>>();
for (const [path, loader] of Object.entries(rawModules)) {
  const file = path.split('/').pop() ?? path;
  const slug = file.replace(/\.md$/i, '');
  if (slug.toLowerCase() === 'learning-path') continue;
  loaders.set(slug, loader);
  loaders.set(slug.toLowerCase(), loader);
}

function firstHeading(blocks: Block[]): string | null {
  const heading = blocks.find(block => block.kind === 'heading');
  return heading && heading.kind === 'heading' ? heading.text : null;
}

function firstSummary(blocks: Block[]): string {
  const paragraph = blocks.find(block => block.kind === 'paragraph');
  if (!paragraph || paragraph.kind !== 'paragraph') return '';
  const text = paragraph.spans.map(span => span.v).join('');
  return text.length > 160 ? `${text.slice(0, 159)}…` : text;
}

function parseArticle(id: string, src: string): Article {
  const {meta, blocks: rawBlocks} = parseMarkdown(src);
  const headingTitle = firstHeading(rawBlocks);
  const dropFirst = rawBlocks[0]?.kind === 'heading' && rawBlocks[0].depth === 1;
  const blocks = dropFirst ? rawBlocks.slice(1) : rawBlocks;
  const title = (meta.title ?? headingTitle ?? id)
    .replace(/^Статья:\s*/, '')
    .replace(/\s*—\s*где правда заканчивается\s*$/i, '');

  let minutes: number | undefined;
  const minutesRaw = meta.minutes ?? meta['время'];
  if (minutesRaw) {
    const parsed = Number.parseInt(minutesRaw, 10);
    if (Number.isFinite(parsed) && parsed > 0) minutes = parsed;
  }

  return {
    meta: {
      id,
      title,
      summary: firstSummary(blocks),
      minutes,
      prerequisites: [],
      order: 0,
    },
    blocks,
  };
}

export async function loadLearningArticle(slug: string): Promise<Article | undefined> {
  const loader = loaders.get(slug) ?? loaders.get(slug.toLowerCase());
  if (!loader) return undefined;
  const src = await loader();
  return parseArticle(slug, src);
}