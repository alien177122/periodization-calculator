import test from 'node:test';
import assert from 'node:assert/strict';
import {createDb} from '../server/db.js';

test('createDb supports in-memory databases for isolated tests', t => {
  const db = createDb({dbPath: ':memory:'});
  t.after(() => db.close());

  assert.equal(db.userExists('ghost'), false);

  db.createUser('Steve', 'hash');
  assert.equal(db.userExists('Steve'), true);
  assert.deepEqual(db.getUserAuth('Steve'), {
    name: 'Steve',
    password_hash: 'hash',
    token_version: 0,
  });
  assert.deepEqual(db.getUser('Steve'), {});
});

test('createDb persists, updates, and deletes user payloads', t => {
  const db = createDb({dbPath: ':memory:'});
  t.after(() => db.close());

  db.createUser('Athlete', 'hash');

  const payload = {
    name: 'Athlete',
    exercises: [
      {
        exerciseKey: 'bench',
        testWeight: 100,
        testReps: 5,
        oneRM: 117.5,
        date: '2026-04-11',
      },
    ],
    trainingProgress: {completedSessions: 2},
  };

  db.putUser('Athlete', payload);
  assert.deepEqual(db.getUser('Athlete'), payload);

  db.delUser('Athlete');
  assert.equal(db.userExists('Athlete'), false);
  assert.equal(db.getUserAuth('Athlete'), undefined);
  assert.equal(db.getUser('Athlete'), null);
});

test('delUser removes calculation_attempts and billing_payments', t => {
  const db = createDb({dbPath: ':memory:'});
  t.after(() => db.close());

  db.createUser('Athlete', 'hash');
  db.createBillingPayment({
    id: 'pay-del',
    userName: 'Athlete',
    amount: 499,
    currency: 'RUB',
    status: 'PENDING',
    providerTransactionId: 'tx-del',
  });
  db.runConsumeCalculation(
    'Athlete',
    {
      requestId: 'req-del',
      exerciseKey: 'bench',
      testWeight: 100,
      testReps: 5,
      extraWeight: 0,
      freeLimit: 3,
    },
    {oneRM: 116.7},
    true,
  );

  assert.equal(db.listCalculationHistory('Athlete').length, 1);
  assert.ok(db.getBillingPaymentById('pay-del'));

  db.delUser('Athlete');
  assert.equal(db.userExists('Athlete'), false);
  assert.equal(db.listCalculationHistory('Athlete').length, 0);
  assert.equal(db.getBillingPaymentById('pay-del'), undefined);
});

test('createDb rejects duplicate users', t => {
  const db = createDb({dbPath: ':memory:'});
  t.after(() => db.close());

  db.createUser('dup', 'hash-1');

  assert.throws(() => {
    db.createUser('dup', 'hash-2');
  });
});
