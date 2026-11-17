import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();

test('MuscleMap chips are keyboard-accessible tabs with 44px tap targets', async () => {
  const tsx = await readFile(path.join(root, 'src/components/MuscleMap.tsx'), 'utf8');
  const css = await readFile(path.join(root, 'src/styles/components/calculator/muscle-map.css'), 'utf8');

  assert.match(tsx, /role="tab"/);
  assert.match(tsx, /aria-selected=\{ex\.id === active\.id\}/);
  assert.match(tsx, /aria-label=\{`Показать карту стимула: \$\{ex\.name\}`\}/);
  assert.match(tsx, /tabIndex=\{ex\.id === active\.id \? 0 : -1\}/);
  assert.match(tsx, /onKeyDown=/);
  assert.match(tsx, /ArrowRight|ArrowLeft/);

  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /:focus-visible/);
});

test('MuscleMap renders silhouette and bars with accessible labels', async () => {
  const tsx = await readFile(path.join(root, 'src/components/MuscleMap.tsx'), 'utf8');

  assert.match(tsx, /role="img"/);
  assert.match(tsx, /aria-label=\{`Силуэт \$\{label\}: стимул мышц`\}/);
  assert.match(tsx, /aria-label=\{`Стимул мышц: \$\{active\.name\}`\}/);
  assert.match(tsx, /role="tablist"/);
});

test('MuscleMap supports comparison mode and normative hints', async () => {
  const tsx = await readFile(path.join(root, 'src/components/MuscleMap.tsx'), 'utf8');
  const insights = await readFile(path.join(root, 'src/data/exerciseInsights.ts'), 'utf8');

  assert.match(tsx, /compareId/);
  assert.match(tsx, /pv-mmap__compare/);
  assert.match(tsx, /pv-mmap__compare-block/);
  assert.match(tsx, /pv-mmap__insight-norm/);
  assert.match(insights, /norm\?: string/);
  assert.match(insights, /Ориентир:/);
});

test('MuscleMap is mobile-friendly (responsive breakpoints)', async () => {
  const css = await readFile(path.join(root, 'src/styles/components/calculator/muscle-map.css'), 'utf8');

  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /grid-template-columns: 1fr/);
  assert.match(css, /overflow-x: auto/);
});
