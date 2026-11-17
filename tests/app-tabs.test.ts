import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APP_TABS,
  LEGACY_TRAINING_TAB,
  LEGACY_CALCULATOR_TAB,
  isAppTab,
  normalizeTab,
} from '../src/components/app/tabs.ts';
import {HERO_TIPS, heroTipsForTab} from '../src/data/hero-tips.ts';

test('there are two tabs after journal removal (2026-11-16)', () => {
  assert.deepEqual([...APP_TABS], ['split', 'theory']);
  assert.equal(APP_TABS.length, 2);
});

test('the legacy training tab id resolves to the merged split tab', () => {
  assert.equal(LEGACY_TRAINING_TAB, 'training');
  assert.equal(normalizeTab('training'), 'split');
  assert.equal(normalizeTab('split'), 'split');
});

test('the legacy calculator tab id resolves to the merged split tab', () => {
  assert.equal(LEGACY_CALCULATOR_TAB, 'calculator');
  assert.equal(normalizeTab('calculator'), 'split');
  assert.equal(isAppTab('calculator'), false);
});

test('every tab has hero tips', () => {
  for (const tab of APP_TABS) {
    assert.ok(heroTipsForTab(tab).length > 0, `у вкладки ${tab} есть подсказки`);
  }
  assert.deepEqual(Object.keys(HERO_TIPS).sort(), ['split', 'theory']);
});
