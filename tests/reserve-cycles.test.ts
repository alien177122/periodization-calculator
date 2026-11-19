import test from 'node:test';
import assert from 'node:assert/strict';
import {rirFromRpe, adjustedE1rm, sessionPeakWithReserve} from '../packages/shared/src/utils/reserve.ts';
import {buildCycleSeries} from '../packages/shared/src/utils/cycles.ts';

test('rirFromRpe: 6-10 -> 4-0, else null', () => {
  assert.equal(rirFromRpe(8), 2);
  assert.equal(rirFromRpe(10), 0);
  assert.equal(rirFromRpe(6), 4);
  assert.equal(rirFromRpe(5), null);
  assert.equal(rirFromRpe(11), null);
  assert.equal(rirFromRpe(undefined), null);
});

test('adjustedE1rm: 150x3 @8 -> 175.0', () => {
  assert.equal(adjustedE1rm(150, 3, 2), 175);
});

test('adjustedE1rm: 150x3 @10 -> 165.0 (rir 0)', () => {
  assert.equal(adjustedE1rm(150, 3, 0), 165);
});

test('adjustedE1rm: 100x10 @8 -> 140.0 (boundary 12)', () => {
  assert.equal(adjustedE1rm(100, 10, 2), 140);
});

test('adjustedE1rm: 100x11 @8 -> null (effective 13)', () => {
  assert.equal(adjustedE1rm(100, 11, 2), null);
});

test('adjustedE1rm: rpe 5/11 -> null', () => {
  assert.equal(adjustedE1rm(100, 5, rirFromRpe(5)), null);
  assert.equal(adjustedE1rm(100, 5, rirFromRpe(11)), null);
});

test('sessionPeakWithReserve: best raw + best adjusted', () => {
  const sets = [{setIndex: 1, weight: 150, reps: 3, rpe: 8}, {setIndex: 2, weight: 140, reps: 5, rpe: 9}];
  const p = sessionPeakWithReserve(sets);
  assert.ok(p);
  assert.equal(p.raw, 165);
  assert.equal(p.adjusted, 175);
  assert.equal(p.rir, 2);
});

test('buildCycleSeries: 2 cycles -> 2 points with deltas', () => {
  const sessions = [
    {id: '1', exerciseKey: 'bench', date: '2026-01-01', sets: [{setIndex: 1, weight: 100, reps: 5, rpe: 8}]},
    {id: '2', exerciseKey: 'bench', date: '2026-01-29', sets: [{setIndex: 1, weight: 105, reps: 5, rpe: 8}]},
  ];
  const pts = buildCycleSeries(sessions);
  assert.equal(pts.length, 2);
  assert.equal(pts[0].cycle, 1);
  assert.equal(pts[1].cycle, 2);
  assert.equal(pts[0].deltaRaw, null);
  assert.ok(pts[1].deltaRaw != null);
});