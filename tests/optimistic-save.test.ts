import test from 'node:test';
import assert from 'node:assert/strict';
import type {UserData} from '@training/shared/types';
import {optimisticSaveUser} from '@training/shared/utils/optimisticSave';

const baseUser: UserData = {name: 'Steve', exercises: []};

test('optimisticSaveUser rolls back on failed save', async () => {
  let current = baseUser;
  const setUserData = (value: UserData) => {
    current = value;
  };

  const saved = await optimisticSaveUser(
    baseUser,
    {...baseUser, name: 'Changed'},
    setUserData,
    async () => ({ok: false}),
    'token',
  );

  assert.equal(saved, false);
  assert.equal(current.name, 'Steve');
});

test('optimisticSaveUser keeps update on success', async () => {
  let current = baseUser;
  const setUserData = (value: UserData) => {
    current = value;
  };

  const saved = await optimisticSaveUser(
    baseUser,
    {...baseUser, name: 'Changed'},
    setUserData,
    async () => ({ok: true}),
    'token',
  );

  assert.equal(saved, true);
  assert.equal(current.name, 'Changed');
});

test('optimisticSaveUser keeps update when the save is pending offline', async () => {
  let current = baseUser;
  const setUserData = (value: UserData) => {
    current = value;
  };

  const saved = await optimisticSaveUser(
    baseUser,
    {...baseUser, name: 'Changed'},
    setUserData,
    async () => ({ok: true, pending: true}),
    'token',
  );

  assert.equal(saved, true);
  assert.equal(current.name, 'Changed');
});
