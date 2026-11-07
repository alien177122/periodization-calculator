/**
 * Минимальный markdown-парсер для превью самоучителя.
 * Подмножество: front-matter (key: value), заголовки #..####, абзацы,
 * списки (один уровень вложенности), таблицы, fenced-код, цитаты, hr.
 * Инлайн: `code`, **bold**, *italic*, [текст](href).
 */

export type InlineSpan =
  | {t: 'text'; v: string}
  | {t: 'code'; v: string}
  | {t: 'bold'; v: string}
  | {t: 'italic'; v: string}
  | {t: 'link'; v: string; href: string};

export interface ListItem {
  spans: InlineSpan[];
  children: string[];
}

export type Block =
  | {kind: 'heading'; depth: number; text: string}
  | {kind: 'paragraph'; spans: InlineSpan[]}
  | {kind: 'list'; ordered: boolean; items: ListItem[]}
  | {kind: 'table'; head: string[]; rows: string[][]}
  | {kind: 'code'; lang: string; text: string}
  | {kind: 'quote'; spans: InlineSpan[]}
  | {kind: 'hr'};

export interface ParsedDoc {
  meta: Record<string, string>;
  blocks: Block[];
}

const INLINE_RE = /`([^`]+)`|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|\[([^\]]+)\]\(([^)\s]+)[)?]/g;

export function parseInline(raw: string): InlineSpan[] {
  const spans: InlineSpan[] = [];
  let last = 0;
  INLINE_RE.lastIndex = 0;
  for (let m = INLINE_RE.exec(raw); m; m = INLINE_RE.exec(raw)) {
    if (m.index > last) spans.push({t: 'text', v: raw.slice(last, m.index)});
    if (m[1] !== undefined) spans.push({t: 'code', v: m[1]});
    else if (m[2] !== undefined) spans.push({t: 'bold', v: m[2]});
    else if (m[3] !== undefined) spans.push({t: 'italic', v: m[3]});
    else if (m[4] !== undefined) spans.push({t: 'link', v: m[4], href: m[5] ?? ''});
    last = m.index + m[0].length;
  }
  if (last < raw.length) spans.push({t: 'text', v: raw.slice(last)});
  return spans;
}

function splitTableRow(line: string): string[] {
  let cell = line.trim();
  if (cell.startsWith('|')) cell = cell.slice(1);
  if (cell.endsWith('|')) cell = cell.slice(0, -1);
  return cell.split('|').map(c => c.trim());
}

const TABLE_SEP_RE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

export function parseMarkdown(src: string): ParsedDoc {
  const lines = src.replace(/\r\n?/g, '\n').split('\n');
  const meta: Record<string, string> = {};
  const blocks: Block[] = [];

  // Front matter: --- … --- с парами key: value
  let i = 0;
  if (lines[0]?.trim() === '---') {
    for (i = 1; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (line === '---') {
        i += 1;
        break;
      }
      const sep = line.indexOf(':');
      if (sep > 0) meta[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }
  }

  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({kind: 'paragraph', spans: parseInline(paragraph.join(' '))});
      paragraph = [];
    }
  };

  for (; i < lines.length; i += 1) {
    const line = lines[i];

    // Fenced-код
    const fence = line.match(/^\s*(```|~~~)\s*(\S*)\s*$/);
    if (fence) {
      flushParagraph();
      const close = fence[1];
      const lang = fence[2] ?? '';
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !new RegExp(`^\\s*${close}\\s*$`).test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      blocks.push({kind: 'code', lang, text: body.join('\n')});
      continue;
    }

    // Заголовок
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) {
      flushParagraph();
      blocks.push({kind: 'heading', depth: heading[1].length, text: heading[2].trim()});
      continue;
    }

    // hr
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flushParagraph();
      blocks.push({kind: 'hr'});
      continue;
    }

    // Таблица: текущая строка с |, следующая — разделитель
    if (line.includes('|') && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      flushParagraph();
      const head = splitTableRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      i -= 1;
      blocks.push({kind: 'table', head, rows});
      continue;
    }

    // Цитата
    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      const parts: string[] = [quote[1]];
      while (i + 1 < lines.length) {
        const next = lines[i + 1].match(/^\s*>\s?(.*)$/);
        if (!next) break;
        parts.push(next[1]);
        i += 1;
      }
      blocks.push({kind: 'quote', spans: parseInline(parts.join(' '))});
      continue;
    }

    // Элемент списка (один уровень вложенности по отступу)
    const item = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/);
    if (item) {
      flushParagraph();
      const indent = item[1].length;
      const ordered = /\d/.test(item[2]);
      const spans = parseInline(item[3].trim());
      const prev = blocks[blocks.length - 1];
      if (
        indent >= 2 &&
        prev &&
        prev.kind === 'list' &&
        prev.ordered === ordered &&
        prev.items.length > 0
      ) {
        prev.items[prev.items.length - 1].children.push(item[3].trim());
      } else if (
        prev &&
        prev.kind === 'list' &&
        prev.ordered === ordered &&
        (indent === 0 || indent < 2)
      ) {
        prev.items.push({spans, children: []});
      } else {
        blocks.push({
          kind: 'list',
          ordered,
          items: [{spans, children: indent >= 2 ? [] : []}],
        });
      }
      continue;
    }

    // Пустая строка
    if (line.trim() === '') {
      flushParagraph();
      continue;
    }

    paragraph.push(line.trim());
  }
  flushParagraph();

  return {meta, blocks};
}
