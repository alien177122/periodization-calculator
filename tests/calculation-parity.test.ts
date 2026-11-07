import test from 'node:test';
import assert from 'node:assert/strict';
import {calc1RM, roundOneRm} from '../server/calc.js';
import {calc1RM as sharedCalc1RM, calc1RMTs, roundOneRm as sharedRoundOneRm} from '../packages/shared/src/utils/calc.ts';
import {computeOneRm} from '../server/calculations.js';

const METHODS = ['epley', 'brzycki'] as const;

const CASES = [
  {weight: 100, reps: 1},
  {weight: 100, reps: 4},
  {weight: 100, reps: 5},
  {weight: 100, reps: 6},
  {weight: 80, reps: 8},
  {weight: 60, reps: 3},
  {weight: 120, reps: 9},
  {weight: 120, reps: 10},
  {weight: 90.5, reps: 7},
  {weight: 0.5, reps: 5},
  {weight: 100, reps: 30},
  {weight: 250, reps: 2},
];

test('server calc1RM is shared calc1RM for Epley and Brzycki', () => {
  for (const method of METHODS) {
    for (const sample of CASES) {
      const server = calc1RM(sample.weight, sample.reps, method);
      const shared = sharedCalc1RM(sample.weight, sample.reps, method);
      const native = calc1RMTs(sample.weight, sample.reps, method);
      assert.equal(server, shared, `${method} ${sample.weight}×${sample.reps} server vs shared`);
      assert.equal(shared, native, `${method} ${sample.weight}×${sample.reps} shared vs TS`);
    }
  }
});

test('edge cases: non-positive weight or reps yield 0', () => {
  const edges = [
    {weight: 0, reps: 5},
    {weight: -10, reps: 5},
    {weight: 100, reps: 0},
    {weight: 100, reps: -1},
    {weight: 0, reps: 0},
  ];
  for (const method of METHODS) {
    for (const sample of edges) {
      assert.equal(calc1RM(sample.weight, sample.reps, method), 0, `${method} ${sample.weight}×${sample.reps}`);
      assert.equal(sharedCalc1RM(sample.weight, sample.reps, method), 0);
    }
  }
});

test('roundOneRm is shared one-decimal rounding', () => {
  assert.equal(roundOneRm(120.84), 120.8);
  assert.equal(roundOneRm(120.85), 120.9);
  assert.equal(roundOneRm(0), 0);
  assert.equal(roundOneRm(113.74), sharedRoundOneRm(113.74));
});

test('computeOneRm matches hook rounding for bodyweight totals', () => {
  const {oneRM} = computeOneRm({testWeight: 90, testReps: 6});
  const expected = sharedRoundOneRm(sharedCalc1RM(90, 6));
  assert.equal(oneRM, expected);
});

test('known Epley and Brzycki fixtures stay stable', () => {
  assert.equal(sharedCalc1RM(100, 6).toFixed(1), '120.8');
  assert.equal(sharedCalc1RM(80, 10).toFixed(1), '109.3');
  assert.equal(sharedCalc1RM(100, 5, 'brzycki').toFixed(1), '113.7');
  assert.equal(sharedCalc1RM(80, 8, 'brzycki').toFixed(1), '100.1');
});
