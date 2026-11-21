import test from 'node:test';
import assert from 'node:assert/strict';
import {EXERCISES} from '@training/shared/data/exercises';
import {LEG_EXERCISE_KEYS, SPLIT_DAY_LIMITS} from '@training/shared/data/split-exercises';
import {
  allMusclesAssigned,
  buildDayPreview,
  createDefaultSplit,
  distributeSets,
  exerciseKeysForDay,
  excludedExerciseKeysForDay,
  getBaselineSetsPerMuscle,
} from '@training/shared/utils/split-constructor';

test('distributeSets(6, 2) → [3, 3]', () => {
  assert.deepEqual(distributeSets(6, 2), [3, 3]);
});

test('distributeSets(5, 2) → [3, 2]', () => {
  assert.deepEqual(distributeSets(5, 2), [3, 2]);
});

test('distributeSets(4, 2) → [2, 2]', () => {
  assert.deepEqual(distributeSets(4, 2), [2, 2]);
});

test('distributeSets(3, 2) best-effort min 2', () => {
  const result = distributeSets(3, 2);
  assert.equal(
    result.reduce((sum, value) => sum + value, 0),
    3,
  );
  assert.ok(result.every(value => value >= 1));
});

test('getBaselineSetsPerMuscle returns positive totals for main groups', () => {
  const baseline = getBaselineSetsPerMuscle(0);
  assert.ok(baseline.chest > 0);
  assert.ok(baseline.legs > 0);
  assert.ok(baseline.back > 0);
  assert.ok(baseline.triceps > 0);
});

test('default split assigns all muscles once', () => {
  const split = createDefaultSplit();
  assert.equal(allMusclesAssigned(split), true);
});

test('buildDayPreview scheme_only omits meaningful weight', () => {
  const split = createDefaultSplit();
  split.weightMode = 'scheme_only';
  const rows = buildDayPreview({
    split,
    dayNumber: 1,
    weekIndex: 0,
    savedExercises: [],
  });
  assert.ok(rows.length > 0);
  assert.ok(rows.every(row => row.weight === 0));
  assert.ok(rows.every(row => row.scheme.sets >= 1));
});

test('buildDayPreview puts chest exercises on each chest day', () => {
  const split = createDefaultSplit();
  split.daysPerWeek = 3;
  split.days = [
    {dayNumber: 1, muscles: ['chest', 'biceps']},
    {dayNumber: 2, muscles: ['chest']},
    {dayNumber: 3, muscles: ['back']},
  ];

  const day1Bench = buildDayPreview({split, dayNumber: 1, weekIndex: 0, savedExercises: []}).find(
    row => row.key === 'bench',
  );
  const day2Bench = buildDayPreview({split, dayNumber: 2, weekIndex: 0, savedExercises: []}).find(
    row => row.key === 'bench',
  );

  assert.ok(day1Bench);
  assert.ok(day2Bench);
  assert.equal(day1Bench!.scheme.sets, EXERCISES.bench.weekSchemes[0].sets);
  assert.equal(day2Bench!.scheme.sets, EXERCISES.bench.weekSchemes[0].sets);
  assert.equal(day1Bench!.weight, day2Bench!.weight);
});

test('exerciseKeysForDay exposes dips; deadlift is in the legs pool', () => {
  const split = createDefaultSplit();
  split.days = [
    {dayNumber: 1, muscles: ['chest', 'biceps']},
    {dayNumber: 2, muscles: ['legs', 'shoulders']},
    {dayNumber: 3, muscles: ['back', 'triceps']},
  ];
  split.legExercises = ['squat', 'deadlift'];

  assert.ok(exerciseKeysForDay(split, 1).includes('dips'));
  assert.ok(exerciseKeysForDay(split, 2).includes('deadlift'));
  assert.equal(exerciseKeysForDay(split, 3).includes('deadlift'), false);
});

test('default leg day uses exactly two selected leg exercises', () => {
  const split = createDefaultSplit();
  const keys = exerciseKeysForDay(split, 2);
  const legKeys = keys.filter(key => LEG_EXERCISE_KEYS.includes(key as never));
  assert.equal(legKeys.length, 2);
  assert.deepEqual(legKeys, ['squat', 'legPress']);
});

test('custom legExercises limits leg pool', () => {
  const split = createDefaultSplit();
  split.legExercises = ['legExt', 'legCurl'];
  const keys = exerciseKeysForDay(split, 2);
  const legKeys = keys.filter(key => LEG_EXERCISE_KEYS.includes(key as never));
  assert.deepEqual(legKeys, ['legExt', 'legCurl']);
});

test('exerciseKeysForDay caps at six exercises (4 main + 2 extra, этап S1)', () => {
  const split = createDefaultSplit();
  split.days = [
    {dayNumber: 1, muscles: ['chest', 'biceps', 'legs', 'shoulders']},
    {dayNumber: 2, muscles: []},
    {dayNumber: 3, muscles: []},
  ];
  const keys = exerciseKeysForDay(split, 1);
  assert.equal(keys.length, SPLIT_DAY_LIMITS.MAX_EXERCISES_PER_DAY);
  assert.equal(SPLIT_DAY_LIMITS.MAX_EXERCISES_PER_DAY, 6);
});

test('buildDayPreview never returns more rows than the day limit', () => {
  const split = createDefaultSplit();
  split.days = [
    {dayNumber: 1, muscles: ['chest', 'biceps', 'legs', 'shoulders']},
    {dayNumber: 2, muscles: []},
    {dayNumber: 3, muscles: []},
  ];
  const rows = buildDayPreview({split, dayNumber: 1, weekIndex: 0, savedExercises: []});
  assert.ok(rows.length <= SPLIT_DAY_LIMITS.MAX_EXERCISES_PER_DAY);
});

test('excludedExercisesByDay removes exercise from day list and preview', () => {
  const split = createDefaultSplit();
  split.excludedExercisesByDay = {2: ['lateralRaise']};

  const keys = exerciseKeysForDay(split, 2);
  assert.ok(!keys.includes('lateralRaise'));

  const excluded = excludedExerciseKeysForDay(split, 2);
  assert.deepEqual(excluded, ['lateralRaise']);

  const rows = buildDayPreview({split, dayNumber: 2, weekIndex: 0, savedExercises: []});
  assert.ok(!rows.some(row => row.key === 'lateralRaise'));
});

test('excluded exercise can be restored via clearing exclusion', () => {
  const split = createDefaultSplit();
  split.excludedExercisesByDay = {2: ['ohp']};

  assert.ok(!exerciseKeysForDay(split, 2).includes('ohp'));

  split.excludedExercisesByDay = {};
  assert.ok(exerciseKeysForDay(split, 2).includes('ohp'));
});
