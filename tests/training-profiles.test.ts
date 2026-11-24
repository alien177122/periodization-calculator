import test from 'node:test';
import assert from 'node:assert/strict';
import type {CustomSplit} from '../packages/shared/src/types/index.ts';
import {upsertSplit} from '../packages/shared/src/utils/training-profiles.ts';

function split(id: string, profileId: string, name: string): CustomSplit {
  return {
    id,
    name,
    profileId,
    daysPerWeek: 2,
    varyIntensity: true,
    weightMode: 'progression',
    days: [
      {dayNumber: 1, muscles: ['chest']},
      {dayNumber: 2, muscles: ['back']},
    ],
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  };
}

test('upsertSplit keeps splits that belong to another profile', () => {
  const ivanov = split('split-ivanov', 'profile-ivanov', 'Жим');
  const petrov = split('split-petrov', 'profile-petrov', 'Тяга');
  const edited = {...ivanov, name: 'Жим сидя', updatedAt: '2026-08-02T10:00:00.000Z'};

  const next = upsertSplit([ivanov, petrov], edited);

  assert.equal(next.length, 2);
  assert.equal(next.find(item => item.id === 'split-petrov')?.name, 'Тяга');
  assert.equal(next.find(item => item.id === 'split-petrov')?.profileId, 'profile-petrov');
  assert.equal(next.find(item => item.id === 'split-ivanov')?.name, 'Жим сидя');
});
