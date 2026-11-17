#!/usr/bin/env node
/**
 * copy-lint — линтер русского текста лекций (правила §3.1 плана
 * docs/lectures-copy-plan-2026-11-10.md, источник стиля — avoid-ai-writing).
 *
 * Что делает:
 *   1. вытаскивает «прозу»: строковые литералы из TS-данных и текст из markdown;
 *   2. маскирует служебные места — числовые диапазоны, схемы (2+2+2), чипы `pattern`,
 *      fenced-code, инлайн-код, таблицы с числами, английские идентификаторы;
 *   3. ловит шаблонные конструкции и печатает отчёт `путь:строка [rule-id] фрагмент`;
 *   4. ведёт baseline-снимок, чтобы чинить корпус волнами, а не сразу.
 *
 * Режимы:
 *   node scripts/quality/copy-lint.mjs             отчёт по всем нарушениям (exit 1, если есть)
 *   node scripts/quality/copy-lint.mjs --check     только НОВЫЕ относительно baseline (exit 1)
 *   node scripts/quality/copy-lint.mjs --baseline  пересобрать baseline-снимок
 *   node scripts/quality/copy-lint.mjs путь…       свои пути вместо корпуса по умолчанию
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

/** Снимок текущих нарушений: по файлам и правилам. */
export const BASELINE_FILE = 'scripts/quality/copy-lint-baseline.json';

/** Корпус по умолчанию. `*` раскрывается по файлам каталога. */
export const DEFAULT_TARGETS = [
  'packages/shared/src/data/theory.ts',
  'src/data/theory-cardio.ts',
  'selfstudy/content/*.md',
];

/** Ключи объектов, значения которых — служебные строки, а не проза. */
const CHIP_KEYS = new Set([
  'pattern',
  'id',
  'step',
  'chapterId',
  'kind',
  'variant',
  'level',
  'phase',
  'articleId',
  'slug',
  'order',
  'requires',
  'groupId',
  'topicId',
]);

/**
 * @typedef {{id: string, title: string, description: string}} RuleDef
 * @typedef {{start: number, end: number, kind: 'ignore' | 'question'}} Zone
 * @typedef {{line: number, ruleId: string, snippet: string, fingerprint: string}} Violation
 */

/** Таблица правил: id латиницей, описание по-русски. */
export const RULES = [
  {
    id: 'filler',
    title: 'Слова-пустышки',
    description:
      'Маркер значимости вместо факта: «важно», «главное», «ключевой», «стоит отметить», ' +
      '«необходимо отметить», «позволяет», «даёт возможность», «является».',
  },
  {
    id: 'template',
    title: 'Шаблонные обороты',
    description:
      'Клише-обвязка: «В современном мире», «Итак», «Таким образом», «В заключение», ' +
      '«В конечном итоге», «Не стоит забывать».',
  },
  {
    id: 'inflation',
    title: 'Завышение значимости',
    description:
      'Оценки вместо механизма: «революц…», «уникальн…», «изменит подход», ' +
      '«революционный прорыв», «это изменит всё».',
  },
  {
    id: 'generic-conclusion',
    title: 'Общие выводы',
    description:
      'Финал-общее место: «это позволит вам», «вы сможете достичь», «используйте эти принципы».',
  },
  {
    id: 'contrast',
    title: 'Конструкция «не X, а Y»',
    description:
      'Шаблонное противопоставление без реального смысла. Допускается, если в предложении ' +
      'есть числа-примеры, «а не» или параллельные «потому что».',
  },
  {
    id: 'rhetorical-opener',
    title: 'Риторический вопрос в начале',
    description:
      'Предложение начинается с вопросительного слова (как/зачем/почему/что/какой) и ' +
      'заканчивается «?». Вопросы в checkIn и «Проверка» разрешены.',
  },
  {
    id: 'dash-conjunction',
    title: 'Тире как универсальный союз',
    description:
      'Тире «—» вместо союза: «и —», «а —», «— и», «— а». Обычное «тема — описание» не ловится.',
  },
];

/**
 * Границы слова. В JS `\b` считает словом только латиницу, поэтому для кириллицы
 * нужны явные lookaround'ы: иначе «важно» никогда не матчится.
 */
const WL = '(?<![\\wа-яёА-ЯЁ])';
const WR = '(?![\\wа-яёА-ЯЁ])';

/** Наборы шаблонов по правилам (правила с логикой — ниже отдельными функциями). */
const FILLER_PATTERNS = [
  new RegExp(`${WL}важн[а-яё]*${WR}`, 'gi'),
  new RegExp(`${WL}главн(?:ое|ого|ому|ом|ым|ую|ые|ых|ие)${WR}`, 'gi'),
  new RegExp(`${WL}ключев(?:ой|ая|ое|ые|ого|ому|ом|ым|ых)${WR}`, 'gi'),
  new RegExp(`${WL}стоит\\s+отметить${WR}`, 'gi'),
  new RegExp(`${WL}необходимо\\s+отметить${WR}`, 'gi'),
  new RegExp(`${WL}позволя(?:ет|ют|ла|ло|ли|ть)${WR}`, 'gi'),
  new RegExp(`${WL}да[её]т\\s+возможность${WR}`, 'gi'),
  new RegExp(`${WL}явля(?:ет|ются)${WR}`, 'gi'),
];

const TEMPLATE_PATTERNS = [
  new RegExp(`${WL}в\\s+современном\\s+мире${WR}`, 'gi'),
  new RegExp(`${WL}итак${WR}`, 'gi'),
  new RegExp(`${WL}таким\\s+образом${WR}`, 'gi'),
  new RegExp(`${WL}в\\s+заключение${WR}`, 'gi'),
  new RegExp(`${WL}в\\s+конечном\\s+итоге${WR}`, 'gi'),
  new RegExp(`${WL}не\\s+стоит\\s+забывать${WR}`, 'gi'),
];

const INFLATION_PATTERNS = [
  new RegExp(`${WL}революционный\\s+прорыв${WR}`, 'gi'),
  new RegExp(`${WL}революц[а-яё]*${WR}`, 'gi'),
  new RegExp(`${WL}уникальн[а-яё]*${WR}`, 'gi'),
  new RegExp(`${WL}измени[а-яё]*\\s+подход[а-яё]*${WR}`, 'gi'),
  new RegExp(`${WL}это\\s+изменит\\s+вс[её]${WR}`, 'gi'),
];

const GENERIC_PATTERNS = [
  new RegExp(`${WL}это\\s+позволит\\s+вам${WR}`, 'gi'),
  new RegExp(`${WL}вы\\s+сможете\\s+достичь${WR}`, 'gi'),
  new RegExp(`${WL}используйте\\s+эти\\s+принципы${WR}`, 'gi'),
];

const DASH_PATTERNS = [
  new RegExp(`${WL}и\\s+—`, 'g'),
  new RegExp(`${WL}а\\s+—`, 'g'),
  new RegExp(`—\\s+и${WR}`, 'g'),
  new RegExp(`—\\s+а${WR}`, 'g'),
];

/** Вопросительное слово в начале предложения. */
const QUESTION_OPENER = new RegExp(`^(?:какой|какая|какое|какие|как|зачем|почему|что)${WR}`, 'i');

/** Конструкция «не X, а Y». `\u0000` — маска служебных мест, через неё конструкция не тянется. */
const CONTRAST_RE = new RegExp(
  `${WL}не\\s+([^,.;:!?()[\\]«»'"\\u0000]{1,80}?),\\s*а\\s+([^,.;:!?()[\\]«»'"\\u0000]{1,80})`,
  'giu',
);

/** Маскируемые куски текста: диапазоны, схемы, английские идентификаторы. */
const RANGE_RE = /\d+(?:[.,]\d+)?\s*[–—-]\s*\d+(?:[.,]\d+)?/g;
const SCHEME_RE = /\d+(?:\s*\+\s*\d+)+/g;
const REPS_RE = /\d+\s*[×xх]\s*\d+/g;
const LATIN_RE = /[A-Za-z][A-Za-z0-9]*(?:[-–][A-Za-z0-9]+)*/g;
const LATIN_DIGIT_RE = /\d+[A-Za-z][A-Za-z0-9]*(?:[-–][A-Za-z0-9]+)*/g;

/** Название упражнения: 1–3 слова с заглавной, без глагола (в markdown-пунктах). */
const EXERCISE_NAME_RE = /^[А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ]?[а-яё]+){0,2}(?:\s+\d[\d\s×xх+%–—-]*)?$/;

/** Опорные слова, по которым пункт списка опознаётся как название упражнения. */
const EXERCISE_KEYWORDS = [
  'присед',
  'жим',
  'тяга',
  'сгибание',
  'разгибание',
  'подъём',
  'подъем',
  'отжимание',
  'планка',
  'выпад',
  'мах',
  'разворот',
  'наклон',
  'икроножн',
  'двойка',
  'тройка',
  'тейпер',
  'теипер',
];

/* ------------------------------------------------------------------ утилиты */

/**
 * @param {string} text
 * @returns {number[]} индексы начала строк
 */
function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\n') starts.push(i + 1);
  }
  return starts;
}

/**
 * @param {number[]} starts
 * @param {number} index
 * @returns {number} номер строки (с 1)
 */
function lineNumber(starts, index) {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= index) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

/**
 * Маскирует зоны, сохраняя длину строки и переводы строк.
 *
 * @param {string} text
 * @param {Zone[]} zones
 * @returns {string}
 */
function applyZones(text, zones) {
  if (!zones.length) return text;
  const chars = text.split('');
  for (const zone of zones) {
    if (zone.kind !== 'ignore') continue;
    for (let i = Math.max(0, zone.start); i < Math.min(zone.end, chars.length); i += 1) {
      if (chars[i] !== '\n') chars[i] = '\u0000';
    }
  }
  return chars.join('');
}

/**
 * @param {string} text
 * @param {RegExp} re
 * @returns {{start: number, end: number}[]}
 */
function findMatches(text, re) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  const rx = new RegExp(re.source, flags);
  /** @type {{start: number, end: number}[]} */
  const out = [];
  let match;
  while ((match = rx.exec(text)) !== null) {
    if (match[0].length === 0) {
      rx.lastIndex += 1;
      continue;
    }
    out.push({start: match.index, end: match.index + match[0].length});
  }
  return out;
}

/**
 * Убирает пересекающиеся совпадения (оставляем самое длинное).
 *
 * @param {{start: number, end: number}[]} matches
 * @returns {{start: number, end: number}[]}
 */
function dropOverlaps(matches) {
  const sorted = [...matches].sort((a, b) => a.start - b.start || b.end - a.end);
  /** @type {{start: number, end: number}[]} */
  const out = [];
  for (const item of sorted) {
    const last = out[out.length - 1];
    if (last && item.start < last.end) continue;
    out.push(item);
  }
  return out;
}

/**
 * Делит текст на предложения (по знакам конца и переводам строк).
 *
 * @param {string} text
 * @returns {{start: number, end: number}[]}
 */
function splitSentences(text) {
  /** @type {{start: number, end: number}[]} */
  const out = [];
  let start = 0;
  const push = (from, to) => {
    if (to > from) out.push({start: from, end: to});
  };
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '\n') {
      push(start, i);
      start = i + 1;
      continue;
    }
    if (ch !== '.' && ch !== '!' && ch !== '?' && ch !== '…') continue;
    let j = i;
    while (j + 1 < text.length && '.!?…'.includes(text[j + 1])) j += 1;
    let k = j + 1;
    while (k < text.length && '»")”]'.includes(text[k])) k += 1;
    if (k >= text.length || /\s/.test(text[k])) {
      push(start, k);
      start = k;
      i = k - 1;
    }
  }
  push(start, text.length);
  return out;
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalize(value) {
  return value.replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Стабильный отпечаток нарушения: правило + текст + предложение-контекст.
 * Не зависит от номера строки, поэтому правки выше по файлу его не ломают.
 *
 * @param {string} ruleId
 * @param {string} text
 * @param {number} start
 * @param {number} end
 * @param {string} [context]
 * @returns {string}
 */
function fingerprintOf(ruleId, text, start, end, context = '') {
  const hit = normalize(text.slice(start, end));
  const around = normalize(context || text.slice(start, end)).slice(0, 120);
  return `${ruleId}|${hit}|${around}`;
}

/**
 * Поиск предложения, которому принадлежит смещение.
 *
 * @param {{start: number, end: number}[]} sentences
 * @param {string} original
 * @returns {(index: number) => string}
 */
function sentenceContext(sentences, original) {
  return index => {
    const found = sentences.find(item => item.start <= index && item.end >= index);
    return found ? original.slice(found.start, found.end) : '';
  };
}

/* ------------------------------------------------- извлечение прозы из TS */

/**
 * @typedef {{value: string, start: number, end: number, key: string|null, ctx: string[]}} TsString
 */

/**
 * Сканер TS-файла: находит строковые литералы вместе с ключом объекта.
 *
 * @param {string} text
 * @returns {TsString[]}
 */
function scanTsStrings(text) {
  /** @type {TsString[]} */
  const out = [];
  /** @type {(string|null)[]} */
  const stack = [];
  let lastKey = null;
  let prevNonSpace = '';
  let atLineStart = true;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const ch = text[i];

    if (ch === '\n') {
      atLineStart = true;
      prevNonSpace = '\n';
      i += 1;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\r') {
      i += 1;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') {
      while (i < n && text[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      i += 2;
      while (i < n && !(text[i] === '*' && text[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch;
      const start = i;
      i += 1;
      let value = '';
      while (i < n) {
        if (text[i] === '\\' && quote !== '`') {
          value += text[i + 1] ?? '';
          i += 2;
          continue;
        }
        if (text[i] === quote) break;
        value += text[i];
        i += 1;
      }
      i += 1;
      out.push({value, start, end: i, key: lastKey, ctx: stack.filter(Boolean)});
      prevNonSpace = '"';
      atLineStart = false;
      continue;
    }
    if (ch === '{') {
      stack.push(lastKey);
      lastKey = null;
      prevNonSpace = '{';
      atLineStart = false;
      i += 1;
      continue;
    }
    if (ch === '}') {
      lastKey = stack.pop() ?? null;
      prevNonSpace = '}';
      atLineStart = false;
      i += 1;
      continue;
    }
    if (/[A-Za-z_$]/.test(ch)) {
      const idStart = i;
      while (i < n && /[A-Za-z0-9_$]/.test(text[i])) i += 1;
      const id = text.slice(idStart, i);
      let j = i;
      while (j < n && /\s/.test(text[j])) j += 1;
      if (text[j] === '?') j += 1;
      while (j < n && /\s/.test(text[j])) j += 1;
      const keyPosition =
        atLineStart || prevNonSpace === '{' || prevNonSpace === ',' || prevNonSpace === ';';
      if (text[j] === ':' && keyPosition) {
        lastKey = id;
        i = j + 1;
      }
      prevNonSpace = 'x';
      atLineStart = false;
      continue;
    }
    prevNonSpace = ch;
    atLineStart = false;
    i += 1;
  }
  return out;
}

/**
 * Проза в TS-файле — строковые литералы без служебного ключа и с кириллицей.
 *
 * @param {string} text
 * @returns {{prose: {start: number, end: number, isQuestion: boolean}[], zones: Zone[]}}
 */
function tsProse(text) {
  const strings = scanTsStrings(text);
  /** @type {{start: number, end: number, isQuestion: boolean}[]} */
  const prose = [];
  for (const item of strings) {
    if (!item.value) continue;
    if (item.key && CHIP_KEYS.has(item.key)) continue;
    if (!/[Ѐ-ӿ]/.test(item.value)) continue;
    const isQuestion = item.ctx.includes('checkIn') && item.key === 'question';
    prose.push({start: item.start, end: item.end, isQuestion});
  }
  prose.sort((a, b) => a.start - b.start);

  // Всё, что не проза, — служебное: маскируем целиком.
  /** @type {Zone[]} */
  const zones = [];
  let cursor = 0;
  for (const item of prose) {
    if (item.start > cursor) zones.push({start: cursor, end: item.start, kind: 'ignore'});
    cursor = item.end;
  }
  if (cursor < text.length) zones.push({start: cursor, end: text.length, kind: 'ignore'});
  return {prose, zones};
}

/* ----------------------------------------------- извлечение прозы из md */

/**
 * @param {string} text
 * @returns {Zone[]}
 */
function markdownZones(text) {
  /** @type {Zone[]} */
  const zones = [];
  const lines = text.split('\n');
  let offset = 0;
  let inFence = false;
  let fenceMarker = '';

  for (const line of lines) {
    const lineStart = offset;
    const lineEnd = offset + line.length;
    offset = lineEnd + 1;

    const fenceMatch = /^\s*(```|~~~)/.exec(line);
    if (fenceMatch) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fenceMatch[1];
      } else if (line.trim().startsWith(fenceMarker)) {
        inFence = false;
        fenceMarker = '';
      }
      zones.push({start: lineStart, end: lineEnd, kind: 'ignore'});
      continue;
    }
    if (inFence) {
      zones.push({start: lineStart, end: lineEnd, kind: 'ignore'});
      continue;
    }

    // Инлайн-код.
    for (const match of findMatches(line, /`[^`\n]+`/g)) {
      zones.push({start: lineStart + match.start, end: lineStart + match.end, kind: 'ignore'});
    }

    // Таблицы с числами и разделители таблиц.
    if (/^\s*\|/.test(line)) {
      const isSeparator = /^\s*\|[\s:|-]+\|?\s*$/.test(line);
      if (isSeparator || /\d/.test(line)) {
        zones.push({start: lineStart, end: lineEnd, kind: 'ignore'});
        continue;
      }
    }

    // Названия упражнений в пунктах списка.
    const item = /^\s*[-*+]\s+(.*)$/.exec(line);
    if (item) {
      const name = item[1].trim();
      const looksLikeName = EXERCISE_NAME_RE.test(name);
      const mentionsExercise = EXERCISE_KEYWORDS.some(word => name.toLowerCase().includes(word));
      if (looksLikeName && mentionsExercise) {
        zones.push({start: lineStart, end: lineEnd, kind: 'ignore'});
        continue;
      }
    }

    // «Проверка» — функциональный вопрос, риторикой не считаем.
    if (/^\s*\**\s*Проверка(?![\wа-яёА-ЯЁ])/i.test(line)) {
      zones.push({start: lineStart, end: lineEnd, kind: 'question'});
    }
  }
  return zones;
}

/* ------------------------------------------------------------------ зоны */

/**
 * Общие маски: диапазоны, схемы, английские идентификаторы.
 *
 * @param {string} text
 * @returns {Zone[]}
 */
function commonZones(text) {
  /** @type {Zone[]} */
  const zones = [];
  for (const re of [RANGE_RE, SCHEME_RE, REPS_RE, LATIN_RE, LATIN_DIGIT_RE]) {
    for (const match of findMatches(text, re)) {
      zones.push({start: match.start, end: match.end, kind: 'ignore'});
    }
  }
  return zones;
}

/**
 * Готовит текст к проверке: маска прозы и служебных мест.
 *
 * @param {string} text
 * @param {string} filePath
 * @returns {{masked: string, questionZones: Zone[]}}
 */
function prepare(text, filePath) {
  const isTs = /\.(ts|tsx|js|jsx)$/i.test(filePath);
  const isMd = /\.(md|markdown)$/i.test(filePath);

  /** @type {Zone[]} */
  let zones = commonZones(text);
  /** @type {Zone[]} */
  let questionZones = [];

  if (isTs) {
    const {prose, zones: tsZonesList} = tsProse(text);
    zones = zones.concat(tsZonesList);
    questionZones = prose
      .filter(item => item.isQuestion)
      .map(item => ({start: item.start, end: item.end, kind: 'question'}));
  } else if (isMd) {
    const mdZones = markdownZones(text);
    zones = zones.concat(mdZones);
    questionZones = mdZones.filter(zone => zone.kind === 'question');
  }

  return {masked: applyZones(text, zones), questionZones};
}

/* ---------------------------------------------------------------- правила */

/**
 * @param {string} masked
 * @param {RegExp[]} patterns
 * @returns {{start: number, end: number}[]}
 */
function patternMatches(masked, patterns) {
  /** @type {{start: number, end: number}[]} */
  const all = [];
  for (const re of patterns) all.push(...findMatches(masked, re));
  return dropOverlaps(all);
}

/**
 * @param {string} original
 * @param {{start: number, end: number}[]} matches
 * @param {string} ruleId
 * @param {number[]} starts
 * @param {(index: number) => string} contextOf
 * @returns {Violation[]}
 */
function toViolations(original, matches, ruleId, starts, contextOf) {
  return matches.map(match => ({
    line: lineNumber(starts, match.start),
    ruleId,
    snippet: makeSnippet(original.slice(match.start, match.end)),
    fingerprint: fingerprintOf(ruleId, original, match.start, match.end, contextOf(match.start)),
  }));
}

/**
 * @param {string} value
 * @returns {string}
 */
function makeSnippet(value) {
  const flat = value.replace(/\s+/g, ' ').trim();
  return flat.length > 110 ? `${flat.slice(0, 109)}…` : flat;
}

/**
 * Конструкция «не X, а Y» без реального противопоставления.
 *
 * @param {string} original
 * @param {string} masked
 * @param {number[]} starts
 * @param {(index: number) => string} contextOf
 * @returns {Violation[]}
 */
function contrastViolations(original, masked, starts, contextOf) {
  /** @type {Violation[]} */
  const out = [];
  for (const match of findMatches(masked, CONTRAST_RE)) {
    const left = masked.slice(match.start, match.end);
    // В левой части должен быть смысловой текст, а не только маска.
    if (!/[а-яё]/i.test(left)) continue;
    // Числа-примеры — реальное противопоставление.
    if (/\d/.test(contextOf(match.start))) continue;
    // «не X, а не Y» — настоящее различие.
    if (/,\s*а\s+не\s/i.test(left)) continue;
    // Параллельные «потому что …, а потому что …».
    if (/,\s*а\s+потому\s+что\s/i.test(left)) continue;
    if (/(?:^|[^\wа-яёА-ЯЁ])не\s+потому\s+что\s/i.test(left)) continue;
    out.push({
      line: lineNumber(starts, match.start),
      ruleId: 'contrast',
      snippet: makeSnippet(original.slice(match.start, match.end)),
      fingerprint: fingerprintOf(
        'contrast',
        original,
        match.start,
        match.end,
        contextOf(match.start),
      ),
    });
  }
  return out;
}

/**
 * Риторический вопрос в начале предложения.
 *
 * @param {string} original
 * @param {string} masked
 * @param {number[]} starts
 * @param {Zone[]} questionZones
 * @returns {Violation[]}
 */
function rhetoricalViolations(original, masked, starts, questionZones) {
  /** @type {Violation[]} */
  const out = [];
  for (const sentence of splitSentences(masked)) {
    const raw = masked.slice(sentence.start, sentence.end);
    if (!raw.trim().endsWith('?')) continue;
    const head = raw.trim().replace(/^[«"'(]*\s*/, '');
    if (!QUESTION_OPENER.test(head)) continue;
    // Вопрос разрешён там, где он функциональный: checkIn и «Проверка».
    const inQuestionZone = questionZones.some(
      zone => zone.start <= sentence.start && zone.end >= sentence.start,
    );
    if (inQuestionZone) continue;
    out.push({
      line: lineNumber(starts, sentence.start),
      ruleId: 'rhetorical-opener',
      snippet: makeSnippet(original.slice(sentence.start, sentence.end)),
      fingerprint: fingerprintOf(
        'rhetorical-opener',
        original,
        sentence.start,
        sentence.end,
        original.slice(sentence.start, sentence.end),
      ),
    });
  }
  return out;
}

/**
 * Основная проверка одного файла.
 *
 * @param {string} text содержимое файла
 * @param {{filePath?: string}} [options]
 * @returns {Violation[]}
 */
export function lintText(text, options = {}) {
  const filePath = options.filePath ?? '';
  const {masked, questionZones} = prepare(text, filePath);
  const starts = lineStarts(text);
  const contextOf = sentenceContext(splitSentences(masked), text);

  /** @type {Violation[]} */
  const out = [];
  out.push(
    ...toViolations(text, patternMatches(masked, FILLER_PATTERNS), 'filler', starts, contextOf),
  );
  out.push(
    ...toViolations(text, patternMatches(masked, TEMPLATE_PATTERNS), 'template', starts, contextOf),
  );
  out.push(
    ...toViolations(
      text,
      patternMatches(masked, INFLATION_PATTERNS),
      'inflation',
      starts,
      contextOf,
    ),
  );
  out.push(
    ...toViolations(
      text,
      patternMatches(masked, GENERIC_PATTERNS),
      'generic-conclusion',
      starts,
      contextOf,
    ),
  );
  out.push(...contrastViolations(text, masked, starts, contextOf));
  out.push(...rhetoricalViolations(text, masked, starts, questionZones));
  out.push(
    ...toViolations(
      text,
      patternMatches(masked, DASH_PATTERNS),
      'dash-conjunction',
      starts,
      contextOf,
    ),
  );

  out.sort((a, b) => a.line - b.line || a.ruleId.localeCompare(b.ruleId));
  return out;
}

/**
 * Сводка по правилам.
 *
 * @param {Violation[]} violations
 * @returns {Record<string, number>}
 */
export function summarize(violations) {
  /** @type {Record<string, number>} */
  const totals = {};
  for (const rule of RULES) totals[rule.id] = 0;
  for (const item of violations) {
    totals[item.ruleId] = (totals[item.ruleId] ?? 0) + 1;
  }
  return totals;
}

/* -------------------------------------------------------------- работа с файлами */

/**
 * @param {string} target путь относительно корня репозитория
 * @returns {string} абсолютный путь
 */
export function resolveTarget(target) {
  if (path.isAbsolute(target)) return target;
  const fromRoot = path.join(ROOT, target);
  if (fs.existsSync(fromRoot)) return fromRoot;
  return path.resolve(process.cwd(), target);
}

/**
 * @param {string} absolute
 * @returns {string} путь относительно корня репозитория
 */
export function repoPath(absolute) {
  const rel = path.relative(ROOT, absolute);
  return rel.split(path.sep).join('/');
}

/**
 * Раскрывает шаблон с `*` в список файлов.
 *
 * @param {string[]} targets
 * @returns {string[]} абсолютные пути
 */
export function expandTargets(targets) {
  /** @type {string[]} */
  const files = [];
  for (const target of targets) {
    if (!target.includes('*')) {
      files.push(resolveTarget(target));
      continue;
    }
    const dir = path.dirname(resolveTarget(target));
    const base = path.basename(target);
    const pattern = new RegExp(
      `^${base
        .split('*')
        .map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('.*')}$`,
    );
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      if (pattern.test(name)) files.push(path.join(dir, name));
    }
  }
  return [...new Set(files)];
}

/**
 * Проверяет список файлов.
 *
 * @param {string[]} targets пути (могут быть абсолютными)
 * @returns {{path: string, violations: Violation[]}[]}
 */
export function lintFiles(targets) {
  return expandTargets(targets).flatMap(file => {
    if (!fs.existsSync(file)) {
      console.warn(`Пропущен отсутствующий файл: ${repoPath(file)}`);
      return [];
    }
    const text = fs.readFileSync(file, 'utf8');
    return [{path: repoPath(file), violations: lintText(text, {filePath: file})}];
  });
}

/* ------------------------------------------------------------------ baseline */

/**
 * @param {{path: string, violations: Violation[]}[]} files
 * @returns {object}
 */
export function buildBaseline(files) {
  /** @type {Record<string, {total: number, counts: Record<string, number>, fingerprints: Record<string, string[]>}>} */
  const byFile = {};
  /** @type {Record<string, number>} */
  const totals = {};
  for (const rule of RULES) totals[rule.id] = 0;

  for (const file of files) {
    /** @type {Record<string, number>} */
    const counts = {};
    /** @type {Record<string, string[]>} */
    const fingerprints = {};
    for (const rule of RULES) {
      counts[rule.id] = 0;
      fingerprints[rule.id] = [];
    }
    for (const item of file.violations) {
      counts[item.ruleId] = (counts[item.ruleId] ?? 0) + 1;
      fingerprints[item.ruleId] = fingerprints[item.ruleId] ?? [];
      fingerprints[item.ruleId].push(item.fingerprint);
      totals[item.ruleId] = (totals[item.ruleId] ?? 0) + 1;
    }
    for (const rule of RULES) fingerprints[rule.id].sort();
    byFile[file.path] = {
      total: file.violations.length,
      counts,
      fingerprints,
    };
  }

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    targets: files.map(file => file.path),
    totals,
    files: byFile,
  };
}

/**
 * Сравнивает текущие нарушения со снимком.
 *
 * @param {{path: string, violations: Violation[]}[]} files
 * @param {object} baseline
 * @returns {{new: {path: string, violations: Violation[]}[], fixed: number, delta: Record<string, number>}}
 */
export function diffAgainstBaseline(files, baseline) {
  const baselineFiles = baseline && baseline.files ? baseline.files : {};
  /** @type {{path: string, violations: Violation[]}[]} */
  const fresh = [];
  let fixed = 0;
  /** @type {Record<string, number>} */
  const delta = {};
  for (const rule of RULES) delta[rule.id] = 0;

  for (const file of files) {
    const base = baselineFiles[file.path] || {counts: {}, fingerprints: {}};
    /** @type {Record<string, string[]>} */
    const known = {};
    for (const rule of RULES) known[rule.id] = [...((base.fingerprints || {})[rule.id] || [])];

    /** @type {Record<string, Violation[]>} */
    const grouped = {};
    for (const item of file.violations) {
      grouped[item.ruleId] = grouped[item.ruleId] || [];
      grouped[item.ruleId].push(item);
    }

    /** @type {Violation[]} */
    const added = [];
    for (const rule of RULES) {
      const list = grouped[rule.id] || [];
      const pool = known[rule.id];
      for (const item of list) {
        const index = pool.indexOf(item.fingerprint);
        if (index >= 0) pool.splice(index, 1);
        else added.push(item);
      }
      fixed += pool.length;
      delta[rule.id] += added.length;
    }
    if (added.length) fresh.push({path: file.path, violations: added});
  }
  return {new: fresh, fixed, delta};
}

/* ----------------------------------------------------------------------- CLI */

/**
 * @param {string[]} args
 * @returns {number} код возврата
 */
function runCli(args) {
  const wantBaseline = args.includes('--baseline');
  const wantCheck = args.includes('--check');
  const targets = args.filter(arg => !arg.startsWith('--'));
  const files = lintFiles(targets.length ? targets : DEFAULT_TARGETS);

  const allViolations = files.flatMap(file => file.violations);

  if (wantBaseline) {
    const baseline = buildBaseline(files);
    const target = path.join(ROOT, BASELINE_FILE);
    fs.writeFileSync(target, `${JSON.stringify(baseline, null, 2)}\n`, 'utf8');
    console.log(`Baseline обновлён: ${BASELINE_FILE}`);
    printSummary(allViolations, files.length);
    return 0;
  }

  if (wantCheck) {
    const baselinePath = path.join(ROOT, BASELINE_FILE);
    if (!fs.existsSync(baselinePath)) {
      console.error(`Baseline не найден: ${BASELINE_FILE}. Запустите --baseline.`);
      return 2;
    }
    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const diff = diffAgainstBaseline(files, baseline);
    if (diff.new.length) {
      console.log('Новые нарушения относительно baseline:');
      for (const file of diff.new) {
        for (const item of file.violations) {
          console.log(`${file.path}:${item.line} [${item.ruleId}] ${item.snippet}`);
        }
      }
      console.log('');
      printSummary(allViolations, files.length);
      console.log(`Новых: ${diff.new.reduce((sum, file) => sum + file.violations.length, 0)}`);
      console.error('FAIL: copy-lint нашёл новые нарушения');
      return 1;
    }
    printSummary(allViolations, files.length);
    console.log(`Новых нарушений: 0 (исправлено относительно baseline: ${diff.fixed})`);
    console.log('PASS');
    return 0;
  }

  for (const file of files) {
    for (const item of file.violations) {
      console.log(`${file.path}:${item.line} [${item.ruleId}] ${item.snippet}`);
    }
  }
  console.log('');
  printSummary(allViolations, files.length);
  if (allViolations.length) {
    console.error(`FAIL: нарушений — ${allViolations.length}`);
    return 1;
  }
  console.log('PASS');
  return 0;
}

/**
 * @param {Violation[]} violations
 * @param {number} fileCount
 */
function printSummary(violations, fileCount) {
  const totals = summarize(violations);
  console.log('Сводка по правилам:');
  for (const rule of RULES) {
    console.log(`  ${rule.id.padEnd(18)} ${String(totals[rule.id] ?? 0).padStart(5)}`);
  }
  console.log(`  всего: ${violations.length} в ${fileCount} файл(ах)`);
}

const invokedDirectly =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (invokedDirectly) {
  process.exit(runCli(process.argv.slice(2)));
}
