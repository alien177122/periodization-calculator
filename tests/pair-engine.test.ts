import test from 'node:test';
import assert from 'node:assert/strict';
import {verdictPair, suggestPartners, autoPairDay} from '../packages/shared/src/utils/pair-engine.ts';

test('verdictPair: same muscle group -> not ok', () => {
  const v = verdictPair('bench', 'dbPress');
  assert.equal(v.ok, false);
  assert.match(v.reason ?? '', /Обе на chest/);
});

test('verdictPair: deadlift + dips -> ok', () => {
  const v = verdictPair('deadlift', 'dips');
  assert.equal(v.ok, true);
});

test('verdictPair: deadlift + row -> not ok (spinal)', () => {
  const v = verdictPair('deadlift', 'row');
  assert.equal(v.ok, false);
  assert.match(v.reason ?? '', /поясницу/);
});

test('verdictPair: deadlift + pullUp -> ok with grip warning', () => {
  const v = verdictPair('deadlift', 'pullUp');
  assert.equal(v.ok, true);
  assert.ok(v.warn);
});

test('autoPairDay: [deadlift,dips,legPress,row] -> two pairs', () => {
  const blocks = autoPairDay(['deadlift', 'dips', 'legPress', 'row']);
  assert.equal(blocks.length, 2);
  assert.equal(blocks[0].type, 'pair');
  assert.deepEqual(blocks[0].exerciseKeys, ['deadlift', 'dips']);
  assert.equal(blocks[1].type, 'pair');
  assert.deepEqual(blocks[1].exerciseKeys, ['legPress', 'row']);
});

test('autoPairDay: single exercise -> single block', () => {
  const blocks = autoPairDay(['bench']);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'single');
  assert.deepEqual(blocks[0].exerciseKeys, ['bench']);
});

test('suggestPartners returns up to 3', () => {
  const partners = suggestPartners('deadlift', ['dips', 'bench', 'row', 'ohp', 'legPress']);
  assert.ok(partners.length <= 3);
  assert.ok(!partners.includes('deadlift'));
  assert.ok(!partners.includes('row')); // spinal conflict
});