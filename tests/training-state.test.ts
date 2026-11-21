import test from 'node:test'
import assert from 'node:assert/strict'
import {
  deriveTrainingState,
  type DeriveInput,
} from '../src/components/training/trainingState.ts'

function baseInput(overrides: Partial<DeriveInput> = {}): DeriveInput {
  return {
    allSaved: true,
    missingExercises: [],
    programDone: false,
    isMicrocycleBreak: false,
    completedSessions: 0,
    completedMicrocycle: 0,
    currentDayIdx: 0,
    currentWeekIdx: 0,
    currentTrainingExercises: [],
    nextSessions: 1,
    nextDayIdx: 1,
    nextWeekIdx: 0,
    nextTrainingExercises: [],
    ...overrides,
  }
}

test('deriveTrainingState returns locked when not all 1RMs are saved', () => {
  const state = deriveTrainingState(baseInput({
    allSaved: false,
    missingExercises: ['Жим', 'Приседания'],
  }))

  assert.equal(state.kind, 'locked')
  if (state.kind !== 'locked') return
  assert.deepEqual(state.missingExercises, ['Жим', 'Приседания'])
})

test('deriveTrainingState prefers done over break when program is finished', () => {
  const state = deriveTrainingState(baseInput({
    programDone: true,
    isMicrocycleBreak: true,
    completedSessions: 24,
  }))

  assert.equal(state.kind, 'done')
  if (state.kind !== 'done') return
  assert.equal(state.completedSessions, 24)
})

test('deriveTrainingState returns active during a microcycle transition (rest removed)', () => {
  const state = deriveTrainingState(baseInput({
    isMicrocycleBreak: true,
    completedSessions: 3,
    completedMicrocycle: 1,
  }))

  assert.equal(state.kind, 'active')
  if (state.kind !== 'active') return
  assert.equal(state.completedSessions, 3)
})

test('deriveTrainingState defaults to active when nothing special applies', () => {
  const state = deriveTrainingState(baseInput({
    completedSessions: 5,
    currentDayIdx: 2,
    currentWeekIdx: 1,
    nextSessions: 6,
    nextDayIdx: 0,
    nextWeekIdx: 2,
  }))

  assert.equal(state.kind, 'active')
  if (state.kind !== 'active') return
  assert.equal(state.completedSessions, 5)
  assert.equal(state.currentWeekIdx, 1)
  assert.equal(state.nextWeekIdx, 2)
})

test('deriveTrainingState.locked is returned even if programDone=true (guards against bad props)', () => {
  const state = deriveTrainingState(baseInput({
    allSaved: false,
    missingExercises: ['x'],
    programDone: true,
  }))

  assert.equal(state.kind, 'locked')
})
