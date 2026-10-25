import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {calc1RMFromCore, initTrainingCore, isTrainingCoreReady} from '@training/core';
import {calc1RM, calc1RMTs, roundOneRm} from '../packages/shared/src/utils/calc.ts';

const here = dirname(fileURLToPath(import.meta.url));

type OneRmCase = {
  weight: number;
  reps: number;
  method: 'epley' | 'brzycki';
  expected: number;
  rounded: number;
};

const goldenPath = join(here, '../packages/core-rs/golden/one_rm.json');
const cases = JSON.parse(readFileSync(goldenPath, 'utf8')) as OneRmCase[];

test('TS 1RM matches golden JSON (same cases as cargo test)', () => {
  assert.ok(cases.length >= 30);
  for (const sample of cases) {
    const actual = calc1RMTs(sample.weight, sample.reps, sample.method);
    assert.equal(
      actual,
      sample.expected,
      `${sample.method} ${sample.weight}×${sample.reps} TS vs golden`,
    );
    assert.equal(roundOneRm(actual), sample.rounded);
  }
});

test('Node calc1RM uses TS fallback before wasm init', () => {
  assert.equal(isTrainingCoreReady(), false);
  for (const sample of cases.slice(0, 8)) {
    assert.equal(
      calc1RM(sample.weight, sample.reps, sample.method),
      calc1RMTs(sample.weight, sample.reps, sample.method),
    );
  }
});

test('wasm 1RM matches TS golden when core loads', async () => {
  const wasmPath = join(here, '../packages/core/wasm/training_core_bg.wasm');
  let bytes: BufferSource | undefined;
  try {
    bytes = readFileSync(wasmPath);
  } catch {
    bytes = undefined;
  }
  const loaded = await initTrainingCore(bytes);
  if (!loaded) {
    return;
  }
  assert.equal(isTrainingCoreReady(), true);
  for (const sample of cases) {
    const wasm = calc1RMFromCore(sample.weight, sample.reps, sample.method);
    assert.ok(wasm !== null, `${sample.method} ${sample.weight}×${sample.reps} wasm missing`);
    assert.equal(wasm, sample.expected, `${sample.method} ${sample.weight}×${sample.reps} wasm vs golden`);
    assert.equal(
      calc1RM(sample.weight, sample.reps, sample.method),
      sample.expected,
      `${sample.method} ${sample.weight}×${sample.reps} public calc1RM after wasm`,
    );
  }
});
