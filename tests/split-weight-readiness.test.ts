import test from 'node:test';
import assert from 'node:assert/strict';
import type {CustomSplit, SavedExercise} from '../packages/shared/src/types/index.ts';
import {
  areCalculationWeightsReady,
  splitExerciseKeys,
} from '../packages/shared/src/utils/split-weight-readiness.ts';

function splitStub(): CustomSplit {
  return {
    id: 's1',
    name: 'Test',
    daysPerWeek: 4,
    varyIntensity: true,
    weightMode: 'progression',
    days: [
      {dayNumber: 1, muscles: ['chest']},
      {dayNumber: 2, muscles: ['back']},
      {dayNumber: 3, muscles: ['legs']},
      {dayNumber: 4, muscles: ['shoulders']},
    ],
    customExercisesByDay: {
      1: ['bench'],
      2: ['deadlift'],
      3: ['squat'],
      4: ['ohp'],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

test('splitExerciseKeys includes day 4 exercises', () => {
  const keys = splitExerciseKeys(splitStub());
  assert.deepEqual(keys.sort(), ['bench', 'deadlift', 'ohp', 'squat']);
});

test('areCalculationWeightsReady requires positive test sets', () => {
  const keys = ['bench', 'squat'];
  const exercises: SavedExercise[] = [
    {
      exerciseKey: 'bench',
      testWeight: 100,
      testReps: 6,
      oneRM: 120,
      date: '1',
    },
  ];
  assert.equal(areCalculationWeightsReady(keys, exercises), false);
  exercises.push({
    exerciseKey: 'squat',
    testWeight: 140,
    testReps: 5,
    oneRM: 160,
    date: '1',
  });
  assert.equal(areCalculationWeightsReady(keys, exercises), true);
});
