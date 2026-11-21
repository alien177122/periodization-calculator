import test from 'node:test';
import assert from 'node:assert/strict';
import {intensityTone, clusterAllowed} from '../packages/shared/src/utils/intensity.ts';
import {buildClusterSets} from '../packages/shared/src/utils/cluster.ts';

test('intensityTone: <70 light, 70-79 medium, >=80 peak', () => {
  assert.equal(intensityTone(60), 'light');
  assert.equal(intensityTone(70), 'medium');
  assert.equal(intensityTone(79), 'medium');
  assert.equal(intensityTone(80), 'peak');
  assert.equal(intensityTone(90), 'peak');
  assert.equal(intensityTone(NaN), 'light');
});

test('clusterAllowed: false at <=80, true at >80', () => {
  assert.equal(clusterAllowed(80), false);
  assert.equal(clusterAllowed(81), true);
  assert.equal(clusterAllowed(70), false);
  assert.equal(clusterAllowed(NaN), false);
});

test('buildClusterSets: 4x4 miniReps=2 -> [2,2] x4', () => {
  const out = buildClusterSets({weight: 100, sets: 4, reps: 4, cluster: {miniReps: 2, intraRestSec: 30}});
  assert.equal(out.length, 4);
  for (const s of out) {
    assert.deepEqual(s.mini, [2, 2]);
    assert.equal(s.intraRestSec, 30);
    assert.equal(s.weight, 100);
  }
});

test('buildClusterSets: reps=3 miniReps=1 -> [1,1,1]', () => {
  const out = buildClusterSets({weight: 50, sets: 1, reps: 3, cluster: {miniReps: 1, intraRestSec: 20}});
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].mini, [1, 1, 1]);
  assert.equal(out[0].intraRestSec, 20);
});

test('buildClusterSets: empty on invalid input', () => {
  assert.deepEqual(buildClusterSets({weight: 100, sets: 0, reps: 4, cluster: {miniReps: 2, intraRestSec: 30}}), []);
  assert.deepEqual(buildClusterSets({weight: 100, sets: 4, reps: 0, cluster: {miniReps: 2, intraRestSec: 30}}), []);
});