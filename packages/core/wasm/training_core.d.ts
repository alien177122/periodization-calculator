/* tslint:disable */
/* eslint-disable */

export function calc1RM(weight: number, reps: number, method: string): number;

export function calcWorkingWeight(one_rm: number, pct: number, step: number, equipment: string): number;

export function ceilToStep(value: number, step: number): number;

export function roundOneRm(value: number): number;

export function roundWeight(value: number, step: number, equipment: string): number;

export function volumeClass(sets: number): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
    readonly memory: WebAssembly.Memory;
    readonly calc1RM: (a: number, b: number, c: number, d: number) => number;
    readonly calcWorkingWeight: (a: number, b: number, c: number, d: number, e: number) => number;
    readonly ceilToStep: (a: number, b: number) => number;
    readonly roundOneRm: (a: number) => number;
    readonly roundWeight: (a: number, b: number, c: number, d: number) => number;
    readonly volumeClass: (a: number) => [number, number];
    readonly __wbindgen_externrefs: WebAssembly.Table;
    readonly __wbindgen_malloc: (a: number, b: number) => number;
    readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
    readonly __wbindgen_free: (a: number, b: number, c: number) => void;
    readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
 *
 * @returns {InitOutput}
 */
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
