import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_PAIR_REST_SEC,
  PAIR_LIMITS,
  hasExercisePairs,
  normalizeExercisePair,
  normalizePairsByDay,
  pairForExercise,
  pairLoopHint,
  pairPartner,
  pairsForDay,
  withExercisePair,
  withoutExercisePair,
} from '../packages/shared/src/data/split-pairs.ts';
import {createSplitFromPreset, getSplitPreset} from '../packages/shared/src/data/split-presets.ts';
import {normalizeLoadedUser} from '../packages/shared/src/utils/api.ts';

const NOW = '2026-11-14T10:00:00.000Z';

function baseSplit() {
  return createSplitFromPreset(getSplitPreset('short-4plus2')!, {id: 'split-1', now: NOW});
}

test('a pair needs two different non-empty exercise keys', () => {
  assert.deepEqual(normalizeExercisePair({a: 'deadlift', b: 'dips'}), {
    id: 'deadlift__dips',
    a: 'deadlift',
    b: 'dips',
    restAfterA: DEFAULT_PAIR_REST_SEC.afterA,
    restAfterB: DEFAULT_PAIR_REST_SEC.afterB,
  });
  assert.equal(normalizeExercisePair({a: 'deadlift', b: 'deadlift'}), null);
  assert.equal(normalizeExercisePair({a: '', b: 'dips'}), null);
  assert.equal(normalizeExercisePair({a: 'deadlift'}), null);
  assert.equal(normalizeExercisePair('deadlift+dips'), null);
});

test('rest hints are clamped to a sane range', () => {
  const pair = normalizeExercisePair({
    a: 'deadlift',
    b: 'dips',
    restAfterA: 5,
    restAfterB: 5000,
  });
  assert.equal(pair?.restAfterA, PAIR_LIMITS.MIN_REST_SEC);
  assert.equal(pair?.restAfterB, PAIR_LIMITS.MAX_REST_SEC);
});

test('one exercise can be in only one pair per day, and pairs per day are capped', () => {
  const normalized = normalizePairsByDay({
    1: [
      {a: 'deadlift', b: 'dips'},
      {a: 'deadlift', b: 'row'},
      {a: 'squat', b: 'legPress'},
      {a: 'pullUp', b: 'curl'},
      {a: 'bench', b: 'ohp'},
      {a: 'legCurl', b: 'dbPress'},
    ],
  });
  const day = normalized?.[1] ?? [];
  assert.equal(day.length, PAIR_LIMITS.MAX_PAIRS_PER_DAY);
  assert.deepEqual(
    day.map(pair => pair.a),
    ['deadlift', 'squat', 'pullUp'],
  );
});

test('pairing replaces an existing pair of either exercise and clearing removes it', () => {
  const split = baseSplit();
  const paired = withExercisePair({split, dayNumber: 1, a: 'deadlift', b: 'dips'});
  assert.equal(hasExercisePairs(paired), true);
  assert.equal(pairPartner(pairForExercise(paired, 1, 'deadlift')!, 'dips'), 'deadlift');

  const rePaired = withExercisePair({split: paired, dayNumber: 1, a: 'dips', b: 'row'});
  const day = pairsForDay(rePaired, 1);
  assert.equal(day.length, 1);
  assert.equal(day[0]?.a, 'dips');
  assert.equal(day[0]?.b, 'row');
  assert.equal(pairForExercise(rePaired, 1, 'deadlift'), undefined);

  const cleared = withoutExercisePair({split: rePaired, dayNumber: 1, exerciseKey: 'row'});
  assert.equal(hasExercisePairs(cleared), false);
  assert.equal(cleared.pairsByDay, undefined);
});

test('the loop hint for default rest is about 6-7 minutes', () => {
  const pair = normalizeExercisePair({a: 'deadlift', b: 'dips'})!;
  assert.equal(pairLoopHint(pair), '≈ 6–7 мин');
});

test('pairs survive the user data round-trip and drop broken entries', () => {
  const split = withExercisePair({
    split: baseSplit(),
    dayNumber: 1,
    a: 'deadlift',
    b: 'dips',
    restAfterA: 240,
  });
  const withBroken = {
    ...split,
    pairsByDay: {1: [{...split.pairsByDay![1]![0], restAfterA: -100}, {a: 'x', b: 'x'}]},
  };

  const user = normalizeLoadedUser(
    {name: 'Steve', exercises: [], splits: [withBroken]},
    'Steve',
  );
  const day = user.splits?.[0]?.pairsByDay?.[1] ?? [];
  assert.equal(day.length, 1);
  assert.equal(day[0]?.a, 'deadlift');
  assert.equal(day[0]?.b, 'dips');
  assert.equal(day[0]?.restAfterA, PAIR_LIMITS.MIN_REST_SEC);
});
