import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RULES,
  buildBaseline,
  diffAgainstBaseline,
  lintText,
  summarize,
} from '../scripts/quality/copy-lint.mjs';

type Violation = {line: number; ruleId: string; snippet: string; fingerprint: string};

/** Нарушения одного правила для короткой фикстуры. */
function ruleIds(text: string, filePath = 'fixture.md'): string[] {
  return (lintText(text, {filePath}) as Violation[]).map(item => item.ruleId);
}

/** Первое нарушение указанного правила (или undefined). */
function firstOf(text: string, ruleId: string, filePath = 'fixture.md'): Violation | undefined {
  return (lintText(text, {filePath}) as Violation[]).find(item => item.ruleId === ruleId);
}

test('правила объявлены с латинскими id и русскими описаниями', () => {
  const ids = RULES.map(rule => rule.id);
  assert.deepEqual(ids, [
    'filler',
    'template',
    'inflation',
    'generic-conclusion',
    'contrast',
    'rhetorical-opener',
    'dash-conjunction',
  ]);
  for (const rule of RULES) {
    assert.ok(rule.title.length > 3, `у правила ${rule.id} есть название`);
    assert.match(rule.description, /[а-яё]/u, `у правила ${rule.id} есть русское описание`);
  }
});

test('filler: маркеры значимости ловятся, номер строки верный', () => {
  const text = 'Первая строка.\nВажно знать про сон.\nПозволяет восстановиться.\n';
  const violations = lintText(text, {filePath: 'fixture.md'}) as Violation[];
  assert.deepEqual(
    violations.map(item => [item.ruleId, item.line]),
    [
      ['filler', 2],
      ['filler', 3],
    ],
  );
  assert.match(violations[0].snippet, /Важно/u);
  assert.equal(summarize(violations).filler, 2);
});

test('template: клише-обвязка ловится', () => {
  assert.deepEqual(ruleIds('Итак, переходим к деталям.'), ['template']);
  assert.deepEqual(ruleIds('В заключение статья о прогрессии.'), ['template']);
  assert.deepEqual(ruleIds('В современном мире простая схема лучше сложной.'), ['template']);
});

test('inflation: оценки вместо механизма ловятся', () => {
  assert.deepEqual(ruleIds('Это изменит подход к тренировке.'), ['inflation']);
  assert.deepEqual(ruleIds('Уникальный подход к нагрузке.'), ['inflation']);
  assert.deepEqual(ruleIds('Революционный прорыв в науке о мышцах.'), ['inflation']);
});

test('generic-conclusion: общие выводы ловятся', () => {
  assert.deepEqual(ruleIds('Используйте эти принципы в своей практике.'), ['generic-conclusion']);
  assert.deepEqual(ruleIds('Это позволит вам достичь цели.'), ['generic-conclusion']);
});

test('contrast: шаблонное «не X, а Y» ловится', () => {
  const violations = firstOf('Отказ — не способ проверки, а маркер усталости.', 'contrast');
  assert.ok(violations, 'конструкция «не X, а Y» должна ловиться');
  assert.match(violations.snippet, /не способ проверки, а маркер усталости/u);
});

test('contrast: числа-примеры, «а не» и параллельные «потому что» — не ложные срабатывания', () => {
  assert.deepEqual(ruleIds('Норма: не 3 подхода, а 2 серии по 4 подхода.'), []);
  assert.deepEqual(ruleIds('Это не про силу, а не про форму тела.'), []);
  assert.deepEqual(
    ruleIds('Не потому что вес большой, а потому что вес создаёт неудобный момент.'),
    [],
  );
});

test('rhetorical-opener: вопрос в начале предложения ловится', () => {
  const violations = firstOf('Почему так происходит?', 'rhetorical-opener');
  assert.ok(violations, 'риторический вопрос должен ловиться');
  assert.equal(violations.line, 1);
});

test('rhetorical-opener: вопрос в «Проверка» разрешён', () => {
  const text =
    '**Проверка:** подход 10 повторений, из которых ты мог сделать 12. Какой это RIR? _(RIR 2.)_';
  assert.deepEqual(ruleIds(text, 'article.md'), []);
});

test('rhetorical-opener: вопрос в checkIn разрешён', () => {
  const source = [
    'export const GROUPS = [',
    '  {',
    "    id: 'g1',",
    '    checkIn: {',
    "      question: 'Какой вход можно выкинуть, если два других сильны?',",
    "      answer: 'Оба нужны: сходятся сигналы.',",
    '    },',
    '  },',
    '];',
  ].join('\n');
  assert.deepEqual(ruleIds(source, 'theory.ts'), []);
});

test('dash-conjunction: тире-союз ловится, обычное «тема — описание» — нет', () => {
  assert.deepEqual(ruleIds('Сон — и восстановление, и готовность к залу.'), ['dash-conjunction']);
  assert.deepEqual(ruleIds('Отказ — это состояние усталости.'), []);
});

test('ложных срабатываний нет на диапазонах и схемах', () => {
  assert.deepEqual(ruleIds('Нагрузка 4,5–6,5% в неделю, пульс 100–120 уд/мин.'), []);
  assert.deepEqual(ruleIds('Рабочая схема 5×(2+2+2) на 85–88% 1ПМ.'), []);
});

test('чипы pattern и служебные строки TS не проверяются', () => {
  const source = [
    'export const TOPICS = [',
    '  {',
    "    id: 'cascade',",
    "    pattern: 'важно → mTORC1 → синтез белка',",
    "    lecture: ['Клетка считает энергию.'],",
    '  },',
    '];',
  ].join('\n');
  assert.deepEqual(ruleIds(source, 'theory.ts'), []);
});

test('код в markdown не проверяется', () => {
  const text = ['```js', '// Важно: mTORC1', 'const x = 1;', '```', ''].join('\n');
  assert.deepEqual(ruleIds(text, 'article.md'), []);
});

test('таблицы с числами не проверяются', () => {
  const text = ['| Параметр | Значение |', '| --- | --- |', '| Важно | 5 |', ''].join('\n');
  assert.deepEqual(ruleIds(text, 'article.md'), []);
});

test('названия упражнений не проверяются', () => {
  const text = ['- Важный жим', '- Присед со штангой', ''].join('\n');
  assert.deepEqual(ruleIds(text, 'article.md'), []);
});

test('английские идентификаторы не дают срабатываний', () => {
  assert.deepEqual(ruleIds('Сигнал mTORC1 идёт через PI3K и Akt.'), []);
});

test('baseline: новое нарушение ловится, исправленное — считается закрытым', () => {
  const before = lintText('Важно знать про сон.', {filePath: 'a.md'}) as Violation[];
  const baseline = buildBaseline([{path: 'a.md', violations: before}]);

  const after = lintText('Важно знать про сон.\nИтак, дальше.', {filePath: 'a.md'}) as Violation[];
  const diff = diffAgainstBaseline([{path: 'a.md', violations: after}], baseline);
  assert.equal(diff.new.length, 1, 'новое «Итак» должно попасть в дельту');
  assert.equal(diff.new[0].violations[0].ruleId, 'template');
  assert.equal(diff.fixed, 0, 'старое нарушение не должно считаться исправленным');

  const cleaned = lintText('Сон восстанавливает мышцы.', {filePath: 'a.md'}) as Violation[];
  const diff2 = diffAgainstBaseline([{path: 'a.md', violations: cleaned}], baseline);
  assert.equal(diff2.new.length, 0);
  assert.equal(diff2.fixed, 1, 'исправленное нарушение засчитывается как закрытое');
});
