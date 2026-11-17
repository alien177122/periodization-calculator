import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzePair, pairVerdict, suggestPairPartner} from '../packages/shared/src/utils/pair-engine.ts';

test('становая + брусья → ok', () => {
  assert.equal(pairVerdict('deadlift', 'dips'), 'ok');
});

test('жим + брусья → конфликт', () => {
  assert.equal(pairVerdict('bench', 'dips'), 'conflict');
});

test('становая + тяга → конфликт по пояснице', () => {
  const a = analyzePair('deadlift', 'row');
  assert.equal(a.verdict, 'conflict');
  assert.ok(a.reason.includes('пояснице'));
});

test('становая + подтягивания → предупреждение по хвату', () => {
  const a = analyzePair('deadlift', 'pullUp');
  assert.equal(a.verdict, 'warning');
  assert.ok(a.reason.includes('хвату') || a.reason.includes('хват'));
});

test('analyzePair возвращает sharedMuscles и timing', () => {
  const a = analyzePair('deadlift', 'dips');
  assert.deepEqual(a.sharedMuscles, []);
  assert.equal(a.timingSec, 370);
});

test('suggestPairPartner picks least overlapping', () => {
  const partner = suggestPairPartner('deadlift', ['dips', 'row', 'pullUp']);
  // dips has no overlap with deadlift
  assert.equal(partner, 'dips');
});
