import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAY_SCHEME_LIMITS,
  daySchemeOverridesFor,
  hasDaySchemeOverrides,
  normalizeDayScheme,
  normalizeDaySchemeOverrides,
  resolveDayScheme,
  withDayScheme,
  withoutDayScheme,
} from '../packages/shared/src/data/split-schemes.ts';
import {
  SPLIT_PRESETS,
  createSplitFromPreset,
  getSplitPreset,
  presetExerciseKeys,
} from '../packages/shared/src/data/split-presets.ts';
import {CATALOG_EXERCISES} from '../packages/shared/src/data/exercises.ts';
import {buildDayPreview} from '../packages/shared/src/utils/split-constructor.ts';
import {buildSplitForecastChart} from '../src/hooks/useSplitForecastChart.ts';
import {normalizeLoadedUser} from '../packages/shared/src/utils/api.ts';

const NOW = '2026-11-13T10:00:00.000Z';

function baseSplit() {
  return createSplitFromPreset(getSplitPreset('short-4plus2')!, {id: 'split-1', now: NOW});
}

test('day scheme falls back to the program scheme and an override wins', () => {
  const split = baseSplit();
  const program = CATALOG_EXERCISES.deadlift.weekSchemes[0];

  assert.deepEqual(
    resolveDayScheme({split, dayNumber: 1, exerciseKey: 'deadlift', weekIndex: 0}),
    program,
  );

  const updated = withDayScheme({
    split,
    dayNumber: 1,
    exerciseKey: 'deadlift',
    scheme: {sets: 5, reps: 4},
  });
  assert.deepEqual(
    resolveDayScheme({split: updated, dayNumber: 1, exerciseKey: 'deadlift', weekIndex: 0}),
    {sets: 5, reps: 4},
  );
  // Схема дня не влияет на другой день.
  assert.deepEqual(
    resolveDayScheme({split: updated, dayNumber: 2, exerciseKey: 'deadlift', weekIndex: 0}),
    CATALOG_EXERCISES.deadlift.weekSchemes[0],
  );
});

test('withDayScheme does not mutate the source split and withoutDayScheme resets to program', () => {
  const split = baseSplit();
  const updated = withDayScheme({
    split,
    dayNumber: 1,
    exerciseKey: 'deadlift',
    scheme: {sets: 5, reps: 4},
  });

  assert.equal(split.schemeOverridesByDay, undefined);
  assert.equal(hasDaySchemeOverrides(split), false);
  assert.equal(hasDaySchemeOverrides(updated), true);
  assert.deepEqual(daySchemeOverridesFor(updated, 1), {deadlift: {sets: 5, reps: 4}});

  const reset = withoutDayScheme({split: updated, dayNumber: 1, exerciseKey: 'deadlift'});
  assert.equal(hasDaySchemeOverrides(reset), false);
  assert.equal(reset.schemeOverridesByDay, undefined);
});

test('normalizeDayScheme rejects out-of-range and non-integer schemes', () => {
  assert.deepEqual(normalizeDayScheme({sets: 4, reps: 8}), {sets: 4, reps: 8});
  assert.equal(normalizeDayScheme({sets: 0, reps: 8}), null);
  assert.equal(normalizeDayScheme({sets: 13, reps: 8}), null);
  assert.equal(normalizeDayScheme({sets: 4, reps: 31}), null);
  assert.equal(normalizeDayScheme({sets: 4.5, reps: 8}), null);
  assert.equal(normalizeDayScheme({sets: '4', reps: 8}), null);
  assert.equal(normalizeDayScheme(null), null);
  assert.equal(DAY_SCHEME_LIMITS.MAX_SETS, 12);
});

test('normalizeDaySchemeOverrides drops broken entries and empty days', () => {
  const normalized = normalizeDaySchemeOverrides({
    1: {deadlift: {sets: 5, reps: 4}, broken: {sets: 0, reps: 4}},
    2: {},
    5: {squat: {sets: 3, reps: 5}},
  });
  assert.deepEqual(normalized, {1: {deadlift: {sets: 5, reps: 4}}});
  assert.equal(normalizeDaySchemeOverrides({}), undefined);
  assert.equal(normalizeDaySchemeOverrides('nope'), undefined);
});

test('buildDayPreview uses the day scheme override for sets and reps', () => {
  const split = withDayScheme({
    split: baseSplit(),
    dayNumber: 1,
    exerciseKey: 'deadlift',
    scheme: {sets: 5, reps: 4},
  });
  const rows = buildDayPreview({split, dayNumber: 1, weekIndex: 0, savedExercises: []});
  const deadlift = rows.find(row => row.key === 'deadlift');

  assert.ok(deadlift, 'становая должна быть в дне');
  assert.deepEqual(deadlift.scheme, {sets: 5, reps: 4});
  assert.equal(deadlift.workingSets.length, 5);
});

test('presets produce valid splits with catalog exercises only', () => {
  assert.ok(SPLIT_PRESETS.length >= 2);
  for (const preset of SPLIT_PRESETS) {
    const split = createSplitFromPreset(preset, {now: NOW});
    assert.equal(split.daysPerWeek, preset.days.length);
    assert.equal(split.days.length, preset.days.length);
    assert.equal(split.customExercisesByDay !== undefined, true);

    for (const day of preset.days) {
      const keys = presetExerciseKeys(day);
      assert.ok(keys.length > 0, `день ${day.dayNumber} пресета ${preset.id} не пуст`);
      assert.ok(keys.length <= 6, `день ${day.dayNumber} пресета ${preset.id} длиннее 6 упражнений`);
      for (const key of keys) {
        assert.ok(CATALOG_EXERCISES[key], `упражнение ${key} должно быть в каталоге`);
      }
      assert.deepEqual(split.customExercisesByDay?.[day.dayNumber], keys);
    }
  }
});

test('owner preset keeps 4 main plus 2 extra exercises per day', () => {
  const preset = getSplitPreset('short-4plus2')!;
  for (const day of preset.days) {
    assert.equal(day.main.length, 4);
    assert.equal((day.extra ?? []).length, 2);
  }
  const standard = getSplitPreset('standard')!;
  assert.equal(standard.readOnly, true);
  assert.equal(preset.readOnly, false);
});

test('week tonnage follows the day scheme override', () => {
  const savedExercises = [
    {exerciseKey: 'deadlift', testWeight: 180, testReps: 3, oneRM: 200, date: '13.11.2026'},
  ];
  const split = baseSplit();
  const before = buildSplitForecastChart(split, savedExercises).weeks[0]?.tonnage ?? 0;

  const updated = withDayScheme({
    split,
    dayNumber: 1,
    exerciseKey: 'deadlift',
    scheme: {sets: 5, reps: 4},
  });
  const after = buildSplitForecastChart(updated, savedExercises).weeks[0]?.tonnage ?? 0;

  assert.ok(before > 0, 'тоннаж до изменения должен считаться');
  assert.ok(after > before, `тоннаж должен вырасти: ${before} → ${after}`);
});

test('scheme overrides survive the user data round-trip', () => {
  const split = withDayScheme({
    split: baseSplit(),
    dayNumber: 1,
    exerciseKey: 'deadlift',
    scheme: {sets: 5, reps: 4},
  });
  const user = normalizeLoadedUser(
    {
      name: 'Steve',
      exercises: [],
      splits: [split],
    },
    'Steve',
  );

  assert.deepEqual(user.splits?.[0]?.schemeOverridesByDay, {1: {deadlift: {sets: 5, reps: 4}}});
});
