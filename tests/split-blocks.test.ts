import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBlocksForDay,
  migrateSplitToBlocks,
  blocksForDay,
} from '../packages/shared/src/data/split-blocks.ts';
import {createSplitFromPreset, getSplitPreset} from '../packages/shared/src/data/split-presets.ts';
import {withExercisePair} from '../packages/shared/src/data/split-pairs.ts';

const NOW = '2026-11-17T10:00:00.000Z';

function baseSplit() {
  return createSplitFromPreset(getSplitPreset('short-4plus2')!, {id: 'split-1', now: NOW});
}

test('buildBlocksForDay produces single blocks for unpaired exercises', () => {
  const split = baseSplit();
  const blocks = buildBlocksForDay(split, 1);
  assert.ok(blocks.length > 0);
  assert.ok(blocks.every(b => b.type === 'single' || b.type === 'pair' || b.type === 'cluster'));
});

test('buildBlocksForDay groups a pair into one pair block', () => {
  const split = withExercisePair({split: baseSplit(), dayNumber: 1, a: 'deadlift', b: 'dips'});
  const blocks = buildBlocksForDay(split, 1);
  const pair = blocks.find(b => b.type === 'pair');
  assert.ok(pair, 'есть pair-блок');
  assert.deepEqual(pair!.exerciseKeys.sort(), ['deadlift', 'dips']);
});

test('migrateSplitToBlocks is idempotent', () => {
  const split = baseSplit();
  const once = migrateSplitToBlocks(split);
  const twice = migrateSplitToBlocks(once);
  assert.equal(once.schemaVersion, 2);
  assert.equal(twice.schemaVersion, 2);
  assert.deepEqual(once.blocksByDay, twice.blocksByDay);
});

test('blocksForDay returns migrated blocks', () => {
  const split = migrateSplitToBlocks(baseSplit());
  const blocks = blocksForDay(split, 1);
  assert.ok(Array.isArray(blocks));
});
