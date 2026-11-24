import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHEET_DISMISS_DISTANCE_PX,
  SHEET_DISMISS_VELOCITY_PX_S,
  SHEET_ENTER_MS,
  SHEET_EXIT_MS,
  SHEET_MOMENTUM_D,
  SHEET_REDUCED_MOTION_MS,
  SHEET_RUBBER_CONSTANT,
  applyRubberY,
  detentHeight,
  nearestValue,
  projectPosition,
  resolveSheetRelease,
  rubberBand,
  sheetMotionMode,
  shouldDismissSheet,
} from '../src/hooks/sheetPhysics.ts';

test('dismiss when dy is greater than 88px', () => {
  assert.equal(shouldDismissSheet(SHEET_DISMISS_DISTANCE_PX, 0), false);
  assert.equal(shouldDismissSheet(SHEET_DISMISS_DISTANCE_PX + 1, 0), true);
  assert.equal(shouldDismissSheet(120, 0), true);
});

test('dismiss when velocityY is greater than 500px/s', () => {
  assert.equal(shouldDismissSheet(0, SHEET_DISMISS_VELOCITY_PX_S), false);
  assert.equal(shouldDismissSheet(0, SHEET_DISMISS_VELOCITY_PX_S + 1), true);
  assert.equal(shouldDismissSheet(10, 720), true);
});

test('reduced-motion is opacity fade without transform travel', () => {
  assert.equal(sheetMotionMode(true), 'fade');
  assert.equal(sheetMotionMode(false), 'travel');
  assert.equal(SHEET_REDUCED_MOTION_MS, 200);
  assert.ok(SHEET_ENTER_MS <= 400);
  assert.ok(SHEET_EXIT_MS <= 250);
});

test('rubber-band uses (overshoot · dim · 0.55) / (dim + 0.55 · |overshoot|)', () => {
  const overshoot = 100;
  const dim = 200;
  const expected =
    (overshoot * dim * SHEET_RUBBER_CONSTANT) / (dim + SHEET_RUBBER_CONSTANT * overshoot);
  assert.equal(rubberBand(overshoot, dim), expected);
  assert.equal(rubberBand(-overshoot, dim), -expected);
  assert.ok(Math.abs(rubberBand(overshoot, dim)) < overshoot);
});

test('rubber-band at the top of the sheet does not pass through minY linearly', () => {
  const resisted = applyRubberY(-80, 0, 800, 800);
  assert.ok(resisted < 0);
  assert.ok(resisted > -80);
});

test('snap uses velocity projection d≈0.998, not the release point', () => {
  assert.equal(SHEET_MOMENTUM_D, 0.998);
  const restYs = [0, 300];
  const releaseY = 80;
  const velocityY = 400;
  const projected = projectPosition(releaseY, velocityY);
  assert.ok(projected > releaseY);
  const snapped = resolveSheetRelease({
    dy: 80,
    velocityY,
    currentY: releaseY,
    restYs,
  });
  assert.equal(snapped, nearestValue(projected, restYs));
  assert.notEqual(snapped, releaseY);
});

test('medium / large detents match min(560px, 72vh) and min(860px, 92vh)', () => {
  assert.equal(detentHeight('medium', 1000), 560);
  assert.equal(detentHeight('medium', 600), 0.72 * 600);
  assert.equal(detentHeight('large', 1000), 860);
  assert.equal(detentHeight('large', 800), 0.92 * 800);
});
