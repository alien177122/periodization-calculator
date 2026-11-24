#!/usr/bin/env node
/*
 * content-s1-validate.mjs — проверка пользовательских текстов по стандарту ASD S1.
 *
 * Запуск:  node scripts/content-s1-validate.mjs [--chapter <id>] [--files <a.ts,b.ts>]
 * Exit 0   = в выбранной зоне 0 нарушений; иначе 1.
 *
 * ЭТО НЕ ШАГ npm test. Тесты — контракт продукта (tests/*-lesson.test.ts),
 * валидатор — производственный инструмент волны.
 *
 * Ограничения (guide §12.2): не проверяет смысл, классы утверждений и императивы;
 * не смотрит строки вне data-файлов; значения `title` вне проверки длины;
 * экранированные юникод-беги не разворачиваются; регуляры/бэктики в коде могут
 * сбить стек — тогда литерал считается «other» и пропускается.
 */

import {readFileSync, existsSync} from 'node:fs';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const SOURCES = [
  {file: 'packages/shared/src/data/theory.ts', kind: 'theory'},
  {file: 'src/data/theory-cardio.ts', kind: 'theory'},
  {file: 'src/data/hero-tips.ts', kind: 'hero'},
  {file: 'packages/shared/src/data/rpe-rir-cards.ts', kind: 'cards'},
];

// Границы глав по строкам theory.ts (на 25.10; при перестройке файла обновить).
const THEORY_RANGES = {
  mtor: [71, 401],
  'diabetes-habits': [402, 626],
  'late-dinner': [627, 824],
  'anabolic-vessels': [825, 1043],
  basics: [1056, 1161],
  basicsLesson: [1167, 1410],
  mechanics: [1533, 1680],
  strength: [1681, 1894],
  tendons: [1895, 2042],
  tiers: [2043, 2301],
  top3: [2302, 2511],
  specs: [2512, 2657],
  progression: [2658, 3304],
};

const CHAPTER_RANGES = {
  '01': ['basics', 'basicsLesson'], '02': ['mtor'], '03': ['tiers'], '04': ['top3'],
  '05': ['specs'], '06': ['tendons'], '07': ['__cardio__'], '08': ['mechanics'],
  '09': ['strength'], '10': ['progression'],
  'diabetes-habits': ['diabetes-habits'], 'late-dinner': ['late-dinner'],
  'anabolic-vessels': ['anabolic-vessels'],
  basics: ['basics', 'basicsLesson'], mtor: ['mtor'], tiers: ['tiers'], top3: ['top3'],
  specs: ['specs'], tendons: ['tendons'], cardio: ['__cardio__'],
  mechanics: ['mechanics'], strength: ['strength'], progression: ['progression'],
};

// Запрещённые синонимы/штампы (граница слова; «повторени..» исключено)
const BANNED = [
  {re: /(?<![A-Za-zА-яЁё])1RM(?![а-яё])/i, rule: 'canon-1RM'},
  {re: /%1RM/i, rule: 'canon-%1RM'},
  {re: /(?<![а-яё])сет(?![а-яё])/iu, rule: 'canon-сет'},
  {re: /(?<![а-яё])сери[яюей](?![а-яё])/iu, rule: 'canon-серия'},
  {re: /(?<![а-яё])повтор(?![а-яё]{0,8}ени)/iu, rule: 'canon-повтор'},
  {re: /(?<![а-яё])раз[аыуов]?(?![а-яё])/iu, rule: 'canon-раз'},
  {re: /(?<![A-Za-z])recovery(?![A-Za-z])/iu, rule: 'canon-recovery'},
  {re: /(?<![а-яё])движени[яюей](?![а-яё])/iu, rule: 'canon-движение'},
  {re: /(?<![а-яё])масс[ауыое](?![а-яё])/iu, rule: 'canon-масса'},
  {re: /отяжелен/iu, rule: 'canon-отяжеление'},
  {re: /рекуперац/iu, rule: 'canon-рекуперация'},
  {re: /рост[аеу]?\s+белка/iu, rule: 'canon-рост-белка'},
  {re: /иначе\s+(говоря|сказать)/iu, rule: 'style-улучшатель'},
  {re: /проще\s+(говоря|сказать)/iu, rule: 'style-улучшатель'},
  {re: /по\s+сути/u, rule: 'style-улучшатель'},
  {re: /важно\s+отметить/u, rule: 'style-штамп'},
  {re: /стоит\s+подчеркнуть/u, rule: 'style-штамп'},
  {re: /в\s+современном\s+мире/u, rule: 'style-штамп'},
  {re: /волшеб/iu, rule: 'style-маркетинг'},
  {re: /эффективнейш/iu, rule: 'style-маркетинг'},
];

// Предохранители между главами (truth-table tests/*-lesson.test.ts)
const HOST_RULES = [
  {re: /прораб/iu, forbidden: ['mechanics', 'strength', 'progression'], rule: 'host-прораб'},
  {re: /стройк/iu, forbidden: ['diabetes-habits', 'late-dinner', 'anabolic-vessels'], rule: 'host-стройк'},
  {re: /Эпли/u, forbidden: ['mechanics', 'strength', 'tendons', 'specs', 'progression'], rule: 'host-Эпли'},
  {re: /4,5–6,5/u, forbidden: ['mechanics', 'strength', 'progression'], rule: 'host-4,5–6,5'},
  {re: /(?<![\d.])1\.[123](?![\d])/u, forbidden: ['tendons'], rule: 'host-1.1/1.2/1.3'},
  {re: /кластер/iu, forbidden: ['tendons'], rule: 'host-кластер'},
];

// Реестр защищённых чисел/терминов (минимум; счёт монотонно вверх)
const REGISTRY = [
  {token: '4,5–6,5', min: 9, name: 'окно-деформации'},
  {token: 'e1RM', min: 9, name: 'e1RM'},
  {token: 'прораб', min: 10, name: 'прораб'},
  {token: 'Эпли', min: 6, name: 'формула-Эпли'},
  {token: 'стройк', min: 2, name: 'стройк'},
];

// Маркеры — инвариант счёта
const MARKERS = [
  {token: 'Якорь:', exact: 28},
  {token: 'Запомнить:', exact: 4},
  {token: 'Что запомнить:', exact: 3},
];

const PROSE_KEYS = new Set([
  'lecture', 'definition', 'body', 'lede', 'answer', 'notes', 'takeaway',
  'text', 'value', 'content', 'summary', 'hint', 'question', 'front', 'back',
]);
const BULLET_KEYS = new Set(['bullets', 'examples']);
const ARRAY_KEYS = new Set(['lecture']);
const SKIP_KEYS = new Set([
  'pattern', 'id', 'step', 'title', 'num', 'kind', 'accentVar', 'tintVar',
  'label', 'name', 'placeholder', 'icon', 'href', 'variant', 'colorVar',
  'basis', 'category', 'source', 'tags', 'difficulty', 'weight',
]);

// ------------------------------------------------------------------ утилиты
function stripComments(src) {
  let out = '';
  let i = 0;
  let mode = 'code';
  while (i < src.length) {
    const ch = src[i];
    const nx = src[i + 1];
    if (mode === 'code') {
      if (ch === '/' && nx === '/') { mode = 'line'; out += '  '; i += 2; continue; }
      if (ch === '/' && nx === '*') { mode = 'block'; out += '  '; i += 2; continue; }
      if (ch === "'") { mode = 's'; out += ch; i++; continue; }
      if (ch === '"') { mode = 'd'; out += ch; i++; continue; }
      if (ch === '`') { mode = 't'; out += ch; i++; continue; }
      out += ch; i++; continue;
    }
    if (mode === 'line') {
      if (ch === '\n') { mode = 'code'; out += ch; } else { out += ' '; }
      i++; continue;
    }
    if (mode === 'block') {
      if (ch === '*' && nx === '/') { mode = 'code'; out += '  '; i += 2; continue; }
      out += ch === '\n' ? '\n' : ' '; i++; continue;
    }
    const q = mode === 's' ? "'" : mode === 'd' ? '"' : '`';
    if (ch === '\\') { out += ch + (nx ?? ''); i += 2; continue; }
    if (ch === q) { mode = 'code'; out += ch; i++; continue; }
    out += ch; i++;
  }
  return out;
}

function lineMap(src) {
  const idx = [0];
  for (let i = 0; i < src.length; i++) if (src[i] === '\n') idx.push(i + 1);
  return idx;
}
function posToLine(mapIdx, pos) {
  let lo = 0, hi = mapIdx.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (mapIdx[mid] <= pos) lo = mid; else hi = mid - 1;
  }
  return lo + 1;
}

function wordCount(text) {
  const toks = text
    .split(/\s+/)
    .map(t => t.replace(/^[^\p{L}\p{N}]+/u, '').replace(/[^\p{L}\p{N}]+$/u, ''))
    .flatMap(t => (t.includes('/') ? t.split('/') : [t]))
    .flatMap(t => (t.includes('×') ? t.split('×') : [t]))
    .flatMap(t => (/^[\d+]+$/.test(t) ? t.split('+') : [t]))
    .filter(t => /[\p{L}\p{N}]/u.test(t));
  return toks.length;
}

function splitSentences(text) {
  return text.split(/(?<=[.!?…])\s+/).map(s => s.trim()).filter(Boolean);
}

/*
 * Сканер литералов clean-кода с атрибуцией:
 *   inline: `key: '…'` → kind по key (prose/bullets/pattern/skip/other)
 *   массив: `lecture: [ '…', '…' ]` → kind «proseBlock» по открывшему ключу;
 *           `bullets:`/`examples:` → «bullets».
 * Литерал получает {start, val, kind, ctxKey}.
 */
function scanLiterals(clean) {
  const out = [];
  const stack = [];
  let lastKey = null;
  let lastKeyEnd = -1;
  let i = 0;
  const n = clean.length;

  const isOpenInlineKey = () =>
    lastKey !== null &&
    lastKeyEnd >= 0 && i > lastKeyEnd &&
    /^[ \t\r\n]*$/.test(clean.slice(lastKeyEnd, i));

  while (i < n) {
    const ch = clean[i];
    if (modeIsStringTail(ch)) { /* unreachable guard */ }

    if (ch === "'" || ch === '"' || ch === '`') {
      const q = ch;
      const start = i;
      let j = i + 1;
      while (j < n) {
        if (clean[j] === '\\') { j += 2; continue; }
        if (clean[j] === q) { j++; break; }
        j++;
      }
      const val = clean.slice(start + 1, j - 1);
      let kind = 'other';
      let ctxKey = null;
      if (isOpenInlineKey()) {
        ctxKey = lastKey;
        kind =
          lastKey === 'pattern' ? 'pattern' :
          PROSE_KEYS.has(lastKey) ? 'prose' :
          BULLET_KEYS.has(lastKey) ? 'bullets' :
          SKIP_KEYS.has(lastKey) ? 'skip' : 'other';
      } else {
        const top = stack[stack.length - 1];
        if (top && top.type === 'arr' && top.key) {
          ctxKey = top.key;
          kind =
            ARRAY_KEYS.has(top.key) || PROSE_KEYS.has(top.key) ? 'proseBlock' :
            BULLET_KEYS.has(top.key) ? 'bullets' : 'other';
        }
      }
      out.push({start, val, kind, ctxKey, key: ctxKey});
      lastKey = null;
      i = j;
      continue;
    }

    // число/идентификатор + «:» — потенциальный inline-ключ
    const m = /^([A-Za-z_$][\w$]*)([ \t]*)?:/.exec(clean.slice(i));
    if (m) {
      lastKey = m[1];
      lastKeyEnd = i + m[0].length;
      i += m[0].length;
      continue;
    }
    if (/[A-Za-z_$\d]/.test(ch)) { // слово без двоеточия — просто пропускаем
      i++;
      continue;
    }
    if (ch === '[') {
      const key = isOpenInlineKey() ? lastKey : null;
      stack.push({type: 'arr', key});
      lastKey = null;
      i++;
      continue;
    }
    if (ch === '{') { stack.push({type: 'obj'}); lastKey = null; i++; continue; }
    if (ch === '}' || ch === ']') { if (stack.length) stack.pop(); lastKey = null; i++; continue; }
    i++; // прочие символы: ( ) , ; . + - = > ? / < < и т.п.
  }
  return out;
  function modeIsStringTail() { return false; }
}

function lineInChapter(file, line, chapterId) {
  if (chapterId === '__cardio__') return file.endsWith('theory-cardio.ts');
  // Числовые диапазоны относятся только к theory.ts — иначе строки других файлов
  // (карты, hero) по номерам попадают в чужие зоны.
  if (!file.includes('theory.ts')) return false;
  const r = THEORY_RANGES[chapterId];
  if (!r) return false;
  return line >= r[0] && line <= r[1];
}

// Зональная принадлежность строки (--chapter); без флага — всегда true.
// Метрики полосы считаются по зоне, чтобы вехи волн проверялись командой.
function inZone(file, line) {
  if (!onlyChapter) return true;
  const ch = CHAPTER_RANGES[onlyChapter];
  if (!ch) return true;
  return ch.some(id => lineInChapter(file, line, id));
}

// ------------------------------------------------------------------- прогон
const args = process.argv.slice(2);
let onlyChapter = null;
let onlyFiles = null;
let onlySent = null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--chapter') onlyChapter = args[i + 1];
  if (args[i] === '--files') onlyFiles = (args[i + 1] || '').split(',').map(s => s.trim()).filter(Boolean);
  if (args[i] === '--sent') { onlySent = args[i + 1]; onlyChapter = args[i + 1]; }
}

const violations = [];
const stats = {files: 0, strings: 0, prose: 0, proseWords: [], hero: 0, long: 0};
const zoneSents = [];
const registryCounts = new Map(REGISTRY.map(r => [r.name, 0]));
const markerFound = new Map(MARKERS.map(m => [m.token, 0]));

for (const entry of SOURCES) {
  if (onlyFiles && !onlyFiles.includes(entry.file)) continue;
  const path = join(REPO, entry.file);
  if (!existsSync(path)) {
    console.error(`skip (нет файла): ${entry.file}`);
    continue;
  }
  const raw = readFileSync(path, 'utf8');
  const clean = stripComments(raw);
  const mapIdx = lineMap(raw);
  stats.files++;

  const literals = scanLiterals(clean);
  stats.strings += literals.length;

  let lectureCounts = [];
  let lectureLine = 0;
  const flushLecture = () => {
    let streak = 0;
    for (const c of lectureCounts) {
      streak = c < 6 ? streak + 1 : 0;
      if (streak >= 3) {
        violations.push({file: entry.file, line: lectureLine, rule: 'streak<6', snippet: 'три предложения подряд короче 6 слов'});
        streak = 0;
      }
    }
  };

  for (const lit of literals) {
    if (lit.val.trim().length < 3) { flushLecture(); lectureCounts = []; continue; }
    const line = posToLine(mapIdx, lit.start);

    // реестр защищённых чисел — на каждом литерале, чтобы «потеря» была видна
    for (const rg of REGISTRY) {
      let c = 0, pos = 0;
      while ((pos = lit.val.indexOf(rg.token, pos)) !== -1) { c++; pos += rg.token.length; }
      registryCounts.set(rg.name, registryCounts.get(rg.name) + c);
    }

    // hero-файл: лимит 40 символов + канон
    if (entry.kind === 'hero') {
      stats.hero++;
      if (lit.val.length > 40) {
        violations.push({file: entry.file, line, rule: 'hero-длина', snippet: `"${lit.val}" (${lit.val.length} симв.)`});
      }
      for (const b of BANNED) if (b.re.test(lit.val)) violations.push({file: entry.file, line, rule: b.rule, snippet: lit.val});
      continue;
    }

    if (lit.kind === 'prose' || lit.kind === 'proseBlock' || lit.kind === 'bullets') {
      for (const h of HOST_RULES) {
        if (!h.re.test(lit.val)) continue;
        if (h.forbidden.some(id => lineInChapter(entry.file, line, id))) {
          violations.push({file: entry.file, line, rule: h.rule, snippet: lit.val});
        }
      }
    }

    if (lit.kind !== 'prose' && lit.kind !== 'proseBlock' && lit.kind !== 'bullets') continue;

    const sents = splitSentences(lit.val);
    const counts = [];
    for (const sent of sents) {
      if (sent.length < 3) continue;
      const len = wordCount(sent);
      counts.push(len);
      if (lit.kind !== 'bullets' && lit.ctxKey !== 'value' && inZone(entry.file, line)) {
        stats.prose++;
        stats.proseWords.push(len);
        if (onlySent && inZone(entry.file, line)) {
          zoneSents.push({file: entry.file.split('/').pop(), line, len, text: sent});
        }
      }
      if (len > 20) {
        stats.long++;
        violations.push({file: entry.file, line, rule: 'длина>20', snippet: `${len} сл: «${sent}»`});
      }
      for (const b of BANNED) {
        if (b.re.test(sent)) violations.push({file: entry.file, line, rule: b.rule, snippet: sent});
      }
      if (lit.kind !== 'bullets') {
        if (/\d\.\d/.test(sent)) violations.push({file: entry.file, line, rule: 'typo-десятичная-точка', snippet: sent});
        if (/[~@]/.test(sent)) violations.push({file: entry.file, line, rule: 'typo-тильда-или-ат', snippet: sent});
        if (/<[ \t]*\d|\d[ \t]*>/.test(sent)) violations.push({file: entry.file, line, rule: 'typo-угол-число', snippet: sent});
        if (/\d[ \t]*-[ \t]*\d/.test(sent)) violations.push({file: entry.file, line, rule: 'typo-дефис-диапазон', snippet: sent});
      }
    }

    // lecture-полоса «короткая серия»
    if (lit.kind === 'proseBlock' && lit.ctxKey === 'lecture') {
      if (lectureCounts.length === 0) lectureLine = line;
      lectureCounts.push(...counts);
    } else {
      flushLecture();
      lectureCounts = [];
    }
  }
  flushLecture();
}

// маркеры: только по теории (cardio без маркеров; проверено rg 25.10)
for (const entry of SOURCES) {
  if (entry.kind !== 'theory') continue;
  const path = join(REPO, entry.file);
  if (!existsSync(path)) continue;
  const clean = stripComments(readFileSync(path, 'utf8'));
  for (const mk of MARKERS) {
    let c = 0, pos = 0;
    while ((pos = clean.indexOf(mk.token, pos)) !== -1) { c++; pos += mk.token.length; }
    markerFound.set(mk.token, (markerFound.get(mk.token) || 0) + c);
  }
}

const zoneFiltered = (v) => {
  if (!onlyChapter) return true;
  const ch = CHAPTER_RANGES[onlyChapter];
  if (!ch) return true;
  return ch.some(id => lineInChapter(v.file, v.line, id));
};

if (!onlyChapter && !onlyFiles) {
  for (const mk of MARKERS) {
    const f = markerFound.get(mk.token) || 0;
    if (f !== mk.exact) {
      violations.push({file: 'theory.ts', line: 0, rule: 'markers', snippet: `«${mk.token}» ожидается ${mk.exact}, найдено ${f}`});
    }
  }
  for (const rg of REGISTRY) {
    const c = registryCounts.get(rg.name) || 0;
    if (c < rg.min) violations.push({file: 'corpus', line: 0, rule: 'registry', snippet: `${rg.name}: ${c}, минимум ${rg.min}`});
  }
}

const shown = violations.filter(zoneFiltered);
console.log('=== ASD S1 content validator ===');
console.log(`sources: ${stats.files} · strings: ${stats.strings} · prose-sentences: ${stats.prose} · hero: ${stats.hero}${onlyChapter ? ` · zone: ${onlyChapter}` : ''}`);
for (const v of shown) console.log(`${v.file}:${v.line}  ${v.rule}  ${v.snippet.replace(/\s+/g, ' ').slice(0, 120)}`);
if (!shown.length && !onlySent) console.log('нарушений в зоне: 0');
if (onlySent) {
  for (const s of zoneSents) console.log(`${s.file}:${s.line} ${String(s.len).padStart(2)} · ${s.text.replace(/\s+/g, ' ').slice(0, 110)}`);
}

const byRule = {};
for (const v of shown) byRule[v.rule] = (byRule[v.rule] || 0) + 1;

const words = [...stats.proseWords].sort((a, b) => a - b);
if (words.length) {
  const p = f => Math.round(100 * words.filter(f).length / words.length);
  console.log(
    `\nполоса (prose): n=${words.length} · медиана ${words[Math.floor(words.length / 2)]} · ≤20=${p(w => w <= 20)}% · 8–20=${p(w => w >= 8 && w <= 20)}% · <8=${p(w => w < 8)}% · <4=${p(w => w < 4)}% · >20=${words.filter(w => w > 20).length}`,
  );
}

console.log(`\nsummary: violations=${shown.length} · правила: ${JSON.stringify(byRule)}`);
process.exit(shown.length ? 1 : 0);
