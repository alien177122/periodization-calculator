import test from 'node:test';
import assert from 'node:assert/strict';
import type {CustomSplit, SavedExercise} from '../packages/shared/src/types/index.ts';
import {buildSplitForecastChart} from '../src/hooks/useSplitForecastChart.ts';

function splitStub(): CustomSplit {
  return {
    id: 's1',
    name: 'Test',
    daysPerWeek: 2,
    varyIntensity: true,
    weightMode: 'progression',
    days: [
      {dayNumber: 1, muscles: ['chest']},
      {dayNumber: 2, muscles: ['back']},
    ],
    customExercisesByDay: {
      1: ['bench'],
      2: ['deadlift'],
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function exercises(): SavedExercise[] {
  return [
    {exerciseKey: 'bench', testWeight: 100, testReps: 6, oneRM: 120, date: '1'},
    {exerciseKey: 'deadlift', testWeight: 160, testReps: 5, oneRM: 180, date: '1'},
  ];
}

test('split forecast chart uses .ta-period geometry (800×280, 7 grid lines, 8 weeks)', () => {
  const model = buildSplitForecastChart(splitStub(), exercises());

  assert.equal(model.viewBox, '0 0 800 280');
  assert.equal(model.weeks.length, 8);
  assert.equal(model.grid.length, 7);
  assert.equal(model.weeks[0]?.x, 56);
  assert.equal(model.weeks[7]?.x, 744);
  assert.equal(model.weeks[0]?.barX, 36);
  assert.ok(model.linePath.startsWith('M '));
  assert.ok(model.areaPath.endsWith('Z'));
  assert.equal(model.hasExercises, true);
  assert.ok(model.weeks.every(week => week.barHeight >= 0));
  assert.ok(model.minTonnage <= model.maxTonnage);
  assert.ok(model.maxTonnage > 0);
  assert.ok(model.weeks.every(week => !('peakWeight' in week)));
  assert.ok(!('series' in model));
});

test('split forecast chart scales bars to min/max tonnage over 8 weeks', () => {
  const model = buildSplitForecastChart(splitStub(), exercises());
  const maxWeek = model.weeks.reduce((best, week) => (week.tonnage >= best.tonnage ? week : best));
  const minWeek = model.weeks.reduce((best, week) => (week.tonnage <= best.tonnage ? week : best));

  assert.equal(maxWeek.tonnage, model.maxTonnage);
  assert.equal(minWeek.tonnage, model.minTonnage);
  assert.ok(Math.abs(maxWeek.y - 28) < 0.5);
  if (model.minTonnage !== model.maxTonnage) {
    assert.ok(Math.abs(minWeek.y - 238) < 0.5);
  }
});
