import type {EquipmentType} from './generated/EquipmentType.ts';
import type {OneRmMethod} from './generated/OneRmMethod.ts';

export type {EquipmentType, OneRmMethod};

type WasmApi = {
  default: (module?: unknown) => Promise<unknown>;
  calc1RM: (weight: number, reps: number, method: string) => number;
  roundOneRm: (value: number) => number;
  ceilToStep: (value: number, step: number) => number;
  roundWeight: (value: number, step: number, equipment: string) => number;
  calcWorkingWeight: (oneRm: number, pct: number, step: number, equipment: string) => number;
  volumeClass: (sets: number) => string;
};

let wasm: WasmApi | null = null;
let initPromise: Promise<boolean> | null = null;

export function isTrainingCoreReady(): boolean {
  return wasm !== null;
}

async function loadWasm(moduleOrPath?: BufferSource): Promise<boolean> {
  try {
    const mod = (await import('../wasm/training_core.js')) as WasmApi;
    if (moduleOrPath) {
      await mod.default({module_or_path: moduleOrPath});
    } else {
      await mod.default();
    }
    wasm = mod;
    return true;
  } catch {
    wasm = null;
    return false;
  }
}

/**
 * Lazy wasm init. Pass bytes in Node tests; in the browser omit args (fetch by URL).
 * Returns false if the artifact is missing — callers keep the TS fallback.
 */
export async function initTrainingCore(moduleOrPath?: BufferSource): Promise<boolean> {
  if (wasm) return true;
  if (!initPromise) {
    initPromise = loadWasm(moduleOrPath).catch(() => {
      initPromise = null;
      return false;
    });
  }
  return initPromise;
}

/** Browser-only: start loading wasm without blocking first paint. */
export function scheduleTrainingCoreInit(): void {
  if (typeof document === 'undefined') return;
  void initTrainingCore();
}

export function calc1RMFromCore(
  weight: number,
  reps: number,
  method: OneRmMethod = 'epley',
): number | null {
  if (!wasm) return null;
  return wasm.calc1RM(weight, reps, method);
}

export function roundOneRmFromCore(value: number): number | null {
  if (!wasm) return null;
  return wasm.roundOneRm(value);
}

export function ceilToStepFromCore(value: number, step: number): number | null {
  if (!wasm) return null;
  return wasm.ceilToStep(value, step);
}

export function roundWeightFromCore(
  value: number,
  step: number,
  equipment: EquipmentType,
): number | null {
  if (!wasm) return null;
  return wasm.roundWeight(value, step, equipment);
}

export function volumeClassFromCore(sets: number): string | null {
  if (!wasm) return null;
  return wasm.volumeClass(sets);
}
