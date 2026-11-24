/**
 * Cluster-подходы (Фаза 1 плана training-minimal-plan).
 *
 * Пример: 4×4 при cluster miniReps=2 → 4 подхода по [2,2], отдых 30с внутри.
 * reps=3, miniReps=1 → [1,1,1] с 20с; reps=4, miniReps=2 → [2,2] с 30с.
 */

export interface ClusterSet {
  set: number;
  mini: number[];
  intraRestSec: number;
  weight: number;
}

export interface ClusterConfig {
  miniReps: number;
  intraRestSec: number;
}

/**
 * Разбивает reps на мини-подходы по miniReps; каждый мини-подход — один элемент массива.
 */
export function buildClusterSets(opts: {
  weight: number;
  sets: number;
  reps: number;
  cluster: ClusterConfig;
}): ClusterSet[] {
  const {weight, sets, reps, cluster} = opts;
  const out: ClusterSet[] = [];
  if (!Number.isFinite(weight) || !Number.isFinite(sets) || !Number.isFinite(reps)) return out;
  if (sets <= 0 || reps <= 0) return out;
  const miniReps = Math.max(1, Math.floor(cluster.miniReps));
  const intraRestSec = Math.max(0, Math.floor(cluster.intraRestSec));
  for (let s = 1; s <= sets; s += 1) {
    const mini: number[] = [];
    let left = reps;
    while (left > 0) {
      const take = Math.min(miniReps, left);
      mini.push(take);
      left -= take;
    }
    out.push({set: s, mini, intraRestSec, weight});
  }
  return out;
}