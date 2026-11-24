import type {
  CustomSplit,
  ExercisePair,
  SplitDayNumber,
} from '../types/index.ts';

/**
 * Связки упражнений (этап S3, docs/split-training-pairing-plan-2026-11-11.md).
 *
 * Решение владельца 2026-11-12: связка — рекомендованная группировка двух
 * упражнений дня, а не строгий план отдыха. В выполнении у каждого упражнения
 * свой таймер; `restAfterA/B` — только подсказка-дефолт.
 *
 * Журнал не меняется: подходы пишутся по exerciseKey, e1RM и тренды как раньше.
 */

export const PAIR_LIMITS = {
  MAX_PAIRS_PER_DAY: 3,
  MIN_REST_SEC: 30,
  MAX_REST_SEC: 900,
} as const;

export const DEFAULT_PAIR_REST_SEC = {
  afterA: 180,
  afterB: 150,
} as const;

/** Сколько примерно длится подход второго упражнения — для оценки петли отдыха. */
const WORK_SEC = 40;

function clampRest(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(PAIR_LIMITS.MAX_REST_SEC, Math.max(PAIR_LIMITS.MIN_REST_SEC, Math.round(value)));
}

/** Все связки дня (пустой массив, если их нет). */
export function pairsForDay(split: CustomSplit, dayNumber: SplitDayNumber): ExercisePair[] {
  return split.pairsByDay?.[dayNumber] ?? [];
}

/** Связка, в которой участвует упражнение (одно упражнение — максимум в одной связке). */
export function pairForExercise(
  split: CustomSplit,
  dayNumber: SplitDayNumber,
  exerciseKey: string,
): ExercisePair | undefined {
  return pairsForDay(split, dayNumber).find(
    pair => pair.a === exerciseKey || pair.b === exerciseKey,
  );
}

/** Партнёр упражнения в связке. */
export function pairPartner(
  pair: ExercisePair,
  exerciseKey: string,
): string | undefined {
  if (pair.a === exerciseKey) return pair.b;
  if (pair.b === exerciseKey) return pair.a;
  return undefined;
}

/**
 * Оценка времени между подходами упражнения A: отдых после A + подход B + отдых после B.
 * Нужна для одной тихой строки в конструкторе, не для таймера.
 */
export function pairLoopSeconds(pair: ExercisePair): number {
  const restAfterA = clampRest(pair.restAfterA, DEFAULT_PAIR_REST_SEC.afterA);
  const restAfterB = clampRest(pair.restAfterB, DEFAULT_PAIR_REST_SEC.afterB);
  return restAfterA + WORK_SEC + restAfterB;
}

/** «≈ 6–7 мин» — грубая вилка, без секунд. */
export function pairLoopHint(pair: ExercisePair): string {
  const total = pairLoopSeconds(pair);
  const low = Math.max(1, Math.round((total - 30) / 60));
  const high = Math.max(low, Math.round((total + 30) / 60));
  return low === high ? `≈ ${low} мин` : `≈ ${low}–${high} мин`;
}

/** Валидная связка или null. */
export function normalizeExercisePair(value: unknown): ExercisePair | null {
  if (typeof value !== 'object' || value === null) return null;
  const raw = value as Record<string, unknown>;
  const a = typeof raw.a === 'string' ? raw.a.trim() : '';
  const b = typeof raw.b === 'string' ? raw.b.trim() : '';
  if (!a || !b || a === b) return null;

  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `${a}__${b}`;
  return {
    id,
    a,
    b,
    restAfterA: clampRest(raw.restAfterA, DEFAULT_PAIR_REST_SEC.afterA),
    restAfterB: clampRest(raw.restAfterB, DEFAULT_PAIR_REST_SEC.afterB),
  };
}

/**
 * Нормализация поля pairsByDay: битые записи отбрасываются, упражнение
 * не может быть в двух связках одного дня, лишние связки сверх лимита — тоже.
 */
export function normalizePairsByDay(input: unknown): CustomSplit['pairsByDay'] {
  if (typeof input !== 'object' || input === null) return undefined;
  const source = input as Record<string, unknown>;
  const result: NonNullable<CustomSplit['pairsByDay']> = {};

  for (const dayNumber of [1, 2, 3, 4] as const) {
    const rawDay = source[String(dayNumber)];
    if (!Array.isArray(rawDay)) continue;

    const pairs: ExercisePair[] = [];
    const used = new Set<string>();
    for (const entry of rawDay) {
      if (pairs.length >= PAIR_LIMITS.MAX_PAIRS_PER_DAY) break;
      const pair = normalizeExercisePair(entry);
      if (!pair) continue;
      if (used.has(pair.a) || used.has(pair.b)) continue;
      used.add(pair.a);
      used.add(pair.b);
      pairs.push(pair);
    }

    if (pairs.length > 0) result[dayNumber] = pairs;
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function withPairs(
  split: CustomSplit,
  dayNumber: SplitDayNumber,
  pairs: ExercisePair[],
): CustomSplit {
  const pairsByDay = {...split.pairsByDay};
  if (pairs.length > 0) {
    pairsByDay[dayNumber] = pairs;
  } else {
    delete pairsByDay[dayNumber];
  }

  return {
    ...split,
    pairsByDay: Object.keys(pairsByDay).length > 0 ? pairsByDay : undefined,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Связывает два упражнения дня. Если любое из них уже в связке — старая
 * связка снимается: одно упражнение живёт максимум в одной паре.
 */
export function withExercisePair(params: {
  split: CustomSplit;
  dayNumber: SplitDayNumber;
  a: string;
  b: string;
  restAfterA?: number;
  restAfterB?: number;
}): CustomSplit {
  const {split, dayNumber, a, b, restAfterA, restAfterB} = params;
  if (!a || !b || a === b) return split;

  const kept = pairsForDay(split, dayNumber).filter(
    pair => pair.a !== a && pair.b !== a && pair.a !== b && pair.b !== b,
  );
  if (kept.length >= PAIR_LIMITS.MAX_PAIRS_PER_DAY) return split;

  const pair: ExercisePair = {
    id: `${a}__${b}`,
    a,
    b,
    restAfterA: clampRest(restAfterA, DEFAULT_PAIR_REST_SEC.afterA),
    restAfterB: clampRest(restAfterB, DEFAULT_PAIR_REST_SEC.afterB),
  };

  return withPairs(split, dayNumber, [...kept, pair]);
}

/** Снимает связку с упражнением (если оно в ней участвовало). */
export function withoutExercisePair(params: {
  split: CustomSplit;
  dayNumber: SplitDayNumber;
  exerciseKey: string;
}): CustomSplit {
  const {split, dayNumber, exerciseKey} = params;
  const current = pairsForDay(split, dayNumber);
  const next = current.filter(
    pair => pair.a !== exerciseKey && pair.b !== exerciseKey,
  );
  if (next.length === current.length) return split;
  return withPairs(split, dayNumber, next);
}

/** Есть ли в сплите хоть одна связка. */
export function hasExercisePairs(split: CustomSplit): boolean {
  return Object.values(split.pairsByDay ?? {}).some(day => (day ?? []).length > 0);
}
