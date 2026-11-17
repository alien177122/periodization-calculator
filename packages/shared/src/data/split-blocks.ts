import type {
  Block,
  CustomSplit,
  ExercisePair,
  SplitDayNumber,
} from '../types/index.ts';
import {pairsForDay} from './split-pairs.ts';

/**
 * Фаза 2 плана: сущность «Блок» выполнения дня.
 *
 * Блоки — производная от `customExercisesByDay` + `pairsByDay`: одно упражнение
 * без связки → single, пара из ExercisePair → pair, 3+ подряд → cluster.
 * Хранятся в `CustomSplit.blocksByDay` для миграции и исполнения (таймер).
 */

/** Строит блоки дня из текущего сплита. Идемпотентно. */
export function buildBlocksForDay(split: CustomSplit, dayNumber: SplitDayNumber): Block[] {
  const keys = split.customExercisesByDay?.[dayNumber] ?? [];
  if (keys.length === 0) return [];

  const pairs = pairsForDay(split, dayNumber);
  const pairMap = new Map<string, ExercisePair>();
  for (const pair of pairs) {
    pairMap.set(pair.a, pair);
    pairMap.set(pair.b, pair);
  }

  const blocks: Block[] = [];
  const used = new Set<string>();

  for (const key of keys) {
    if (used.has(key)) continue;
    const pair = pairMap.get(key);
    if (pair) {
      const partner = pair.a === key ? pair.b : pair.a;
      if (!used.has(partner) && keys.includes(partner)) {
        used.add(key);
        used.add(partner);
        blocks.push({
          id: pair.id,
          type: 'pair',
          exerciseKeys: [key, partner],
          restHintSec: pair.restAfterA,
        });
        continue;
      }
    }
    used.add(key);
    blocks.push({
      id: `single:${key}`,
      type: 'single',
      exerciseKeys: [key],
    });
  }

  // cluster: 3+ подряд без связок объединяем в один блок
  const clustered: Block[] = [];
  let run: Block[] = [];
  for (const block of blocks) {
    if (block.type === 'single' && run.length > 0 && run[run.length - 1].type === 'single') {
      run.push(block);
    } else {
      if (run.length >= 3) {
        clustered.push({
          id: `cluster:${run.map(b => b.exerciseKeys[0]).join('+')}`,
          type: 'cluster',
          exerciseKeys: run.flatMap(b => b.exerciseKeys),
        });
      } else {
        clustered.push(...run);
      }
      run = [block];
    }
  }
  if (run.length >= 3) {
    clustered.push({
      id: `cluster:${run.map(b => b.exerciseKeys[0]).join('+')}`,
      type: 'cluster',
      exerciseKeys: run.flatMap(b => b.exerciseKeys),
    });
  } else {
    clustered.push(...run);
  }

  return clustered;
}

/** Миграция сплита к схеме v2: заполняет blocksByDay и schemaVersion. Идемпотентна. */
export function migrateSplitToBlocks(split: CustomSplit): CustomSplit {
  if (split.schemaVersion === 2 && split.blocksByDay) return split;
  const blocksByDay: NonNullable<CustomSplit['blocksByDay']> = {};
  for (const day of split.days) {
    const blocks = buildBlocksForDay(split, day.dayNumber);
    if (blocks.length > 0) blocksByDay[day.dayNumber] = blocks;
  }
  return {
    ...split,
    blocksByDay: Object.keys(blocksByDay).length > 0 ? blocksByDay : split.blocksByDay,
    schemaVersion: 2,
    updatedAt: split.updatedAt,
  };
}

/** Блоки дня с миграцией на лету. */
export function blocksForDay(split: CustomSplit, dayNumber: SplitDayNumber): Block[] {
  if (split.blocksByDay?.[dayNumber]) return split.blocksByDay[dayNumber]!;
  return buildBlocksForDay(split, dayNumber);
}
