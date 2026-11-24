/**
 * Движок автопар (Фаза 2 плана training-minimal-plan).
 *
 * Чистые функции: verdictPair, suggestPartners, autoPairDay.
 * Использует CATALOG_EXERCISES (primaryMuscle) + простые эвристики.
 */

import {CATALOG_EXERCISES} from '../data/exercises.ts';
import type {Block} from '../types/index.ts';

export interface PairVerdict {
  ok: boolean;
  reason?: string;
  warn?: string;
}

/** Тяжёлая осевая нагрузка на поясницу (становая, тяга в наклоне). */
export function isSpinalLoad(key: string): boolean {
  return key === 'deadlift' || key === 'row';
}

/** Тяжёлый хват (становая, подтягивания, тяга). */
export function gripHeavy(key: string): boolean {
  return key === 'deadlift' || key === 'pullUp' || key === 'row';
}

/** Вердикт пары: можно ли связать два упражнения. */
export function verdictPair(a: string, b: string): PairVerdict {
  const A = CATALOG_EXERCISES[a];
  const B = CATALOG_EXERCISES[b];
  if (!A || !B) return {ok: false, reason: 'нет в каталоге'};
  if (a === b) return {ok: false, reason: 'одно и то же упражнение'};
  if (A.primaryMuscle === B.primaryMuscle)
    return {ok: false, reason: `Обе на ${A.primaryMuscle} — не отдыхают друг друга`};
  if (isSpinalLoad(a) && isSpinalLoad(b))
    return {ok: false, reason: 'Обе грузят поясницу — замени тягу на вариант с упором'};
  if (gripHeavy(a) && gripHeavy(b))
    return {ok: true, warn: 'Хват устанет в обоих — следи за кистями'};
  return {ok: true};
}

/** Приоритет верх/низ: разная группа + верх/низ. */
function isLower(key: string): boolean {
  const cfg = CATALOG_EXERCISES[key];
  return cfg?.primaryMuscle === 'legs';
}

/** Автоподбор партнёров для упражнения a из списка dayKeys (до 3). */
export function suggestPartners(a: string, dayKeys: string[]): string[] {
  const aCfg = CATALOG_EXERCISES[a];
  if (!aCfg) return [];
  const candidates = dayKeys.filter(k => k !== a && CATALOG_EXERCISES[k]);
  const scored = candidates.map(b => {
    const v = verdictPair(a, b);
    if (!v.ok) return null;
    const bCfg = CATALOG_EXERCISES[b]!;
    let score = 0;
    // разная группа мышц
    if (bCfg.primaryMuscle !== aCfg.primaryMuscle) score += 2;
    // верх/низ предпочтительнее
    if (isLower(a) !== isLower(b)) score += 3;
    // предупреждение снижает приоритет
    if (v.warn) score -= 1;
    return {key: b, score};
  }).filter(Boolean) as {key: string; score: number}[];
  scored.sort((x, y) => y.score - x.score);
  return scored.slice(0, 3).map(s => s.key);
}

/** Автосборка дня: тяжёлый низ первым, затем верх, затем добивка → пары. */
export function autoPairDay(keys: string[]): Block[] {
  const valid = keys.filter(k => CATALOG_EXERCISES[k]);
  if (valid.length === 0) return [];

  // разделяем на нижнюю и верхнюю группу
  const lowers = valid.filter(isLower);
  const uppers = valid.filter(k => !isLower(k));

  const pairs: [string, string][] = [];
  const used = new Set<string>();

  // жадно: низ + верх
  const lowersLeft = [...lowers];
  const uppersLeft = [...uppers];
  let attempts = 0;
  const maxAttempts = lowersLeft.length * uppersLeft.length + 1;
  while (lowersLeft.length > 0 && uppersLeft.length > 0 && attempts < maxAttempts) {
    attempts += 1;
    const a = lowersLeft[0];
    const b = uppersLeft[0];
    const v = verdictPair(a, b);
    if (v.ok) {
      pairs.push([a, b]);
      used.add(a);
      used.add(b);
      lowersLeft.shift();
      uppersLeft.shift();
    } else {
      // попробуем другой верхний
      let found = false;
      for (let i = 1; i < uppersLeft.length; i++) {
        const cand = uppersLeft[i];
        if (verdictPair(a, cand).ok) {
          uppersLeft.splice(i, 1);
          pairs.push([a, cand]);
          used.add(a);
          used.add(cand);
          lowersLeft.shift();
          found = true;
          break;
        }
      }
      if (!found) {
        // нет партнёра для a — пропускаем (не break, чтобы не потерять остальные)
        lowersLeft.shift();
        used.add(a);
      }
    }
  }

  // оставшиеся → single
  const singles = valid.filter(k => !used.has(k));

  const blocks: Block[] = [];
  for (const [a, b] of pairs) {
    blocks.push({
      id: `pair:${a}+${b}`,
      type: 'pair',
      exerciseKeys: [a, b],
      setMode: 'linear',
    });
  }
  for (const key of singles) {
    blocks.push({
      id: `single:${key}`,
      type: 'single',
      exerciseKeys: [key],
      setMode: 'linear',
    });
  }

  return blocks;
}