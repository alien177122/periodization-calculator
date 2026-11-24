# AppSheet WAVE 0 — execution note

**Date:** 2026-10-25 · **Branch:** `cursor/appsheet-wave0-9228` · **Base HEAD:** `d4bad117`

Steve confirmed. This is the execution note for **wave 0 only** (IOS-01 + IOS-02). Steve’s full plan is copied at `docs/project/ios-gesture-modal-plan-2026-10-25.md`. Do not edit the Cursor plan artifact.

## Scope

1. **IOS-01** — `AppSheet` engine: portal, grabber, Pointer Events drag, detents medium/large, rubber-band, velocity snap (`d≈0.998`), dismiss `dy>88` or `velocityY>500`, reduced-motion fade, Esc/scrim, focus trap. No vaul, no new packages, no device frame, no change to `src/theme/animations.ts`.
2. **IOS-02** — Pilot: wire unused `SplitCreateDialog` into `SplitConstructorTab` («Новый сплит» opens sheet; submit → `createSavedSplit({ name, daysPerWeek })`). Replace dialog **shell** with AppSheet (`large` detent). Keep form fields and 3-column `.split-create-dialog .split-segment`. Do not migrate ProfileWeightBaseSheet / PyramidHelpDialog / DeleteConfirmDialog / `window.confirm`.

## Stop

Waves 1–3 wait for Steve go/no-go after this pilot.

## Test path

`http://127.0.0.1:5173/?tab=split` → **Новый сплит** → sheet from the bottom → swipe down or Esc to dismiss → submit creates a named split.
