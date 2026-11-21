import test from 'node:test';
import assert from 'node:assert/strict';
import {createDefaultSplit} from '@training/shared/utils/split-constructor';
import {
  resolveDeepLinkSplit,
  resolveSavedSplitSelection,
} from '@training/shared/utils/split-selection';

test('resolveSavedSplitSelection returns explicit saved split', () => {
  const saved = createDefaultSplit('Saved A');
  const other = {...createDefaultSplit('Saved B'), id: crypto.randomUUID()};

  const resolved = resolveSavedSplitSelection([saved, other], saved.id, null);
  assert.equal(resolved?.id, saved.id);
});

test('resolveSavedSplitSelection does not fall back when URL id is unsaved draft', () => {
  const saved = createDefaultSplit('Saved A');
  const draftId = crypto.randomUUID();

  const resolved = resolveSavedSplitSelection([saved], draftId, saved.id);
  assert.equal(resolved, undefined);
});

test('resolveSavedSplitSelection falls back to active split without URL id', () => {
  const first = createDefaultSplit('First');
  const active = {...createDefaultSplit('Active'), id: crypto.randomUUID()};

  const resolved = resolveSavedSplitSelection([first, active], null, active.id);
  assert.equal(resolved?.id, active.id);
});

test('resolveSavedSplitSelection falls back to first saved split', () => {
  const first = createDefaultSplit('First');
  const second = {...createDefaultSplit('Second'), id: crypto.randomUUID()};

  const resolved = resolveSavedSplitSelection([first, second], null, null);
  assert.equal(resolved?.id, first.id);
});

test('resolveDeepLinkSplit finds a split on another profile', () => {
  const current = {...createDefaultSplit('Current'), profileId: 'profile-a'};
  const other = {
    ...createDefaultSplit('Other'),
    id: crypto.randomUUID(),
    profileId: 'profile-b',
  };

  assert.equal(resolveDeepLinkSplit([current, other], other.id)?.id, other.id);
  assert.equal(resolveDeepLinkSplit([current, other], crypto.randomUUID()), undefined);
});
