import test from 'node:test';
import assert from 'node:assert/strict';
import {passwordPolicyError, validatePassword} from '@training/shared/utils/passwordValidation';

test('validatePassword marks empty password invalid', () => {
  const result = validatePassword('');
  assert.equal(result.score, 0);
  assert.equal(result.isValid, false);
});

test('validatePassword requires minimum length of 8', () => {
  const short = validatePassword('Ab1!');
  assert.equal(short.criteria.minLength, false);
  assert.equal(short.isValid, false);
  assert.equal(passwordPolicyError('Ab1!'), 'Пароль минимум 8 символов');
});

test('validatePassword accepts policy-compliant passwords', () => {
  const strong = validatePassword('Squat123');
  assert.equal(strong.criteria.minLength, true);
  assert.equal(strong.isValid, true);
  assert.equal(passwordPolicyError('Squat123'), null);
});

test('validatePassword rejects passwords with only length and no classes', () => {
  const weak = validatePassword('        ');
  assert.equal(weak.criteria.minLength, true);
  assert.equal(weak.score, 1);
  assert.equal(weak.isValid, false);
  assert.ok(passwordPolicyError('        '));
});

test('validatePassword requires at least three character classes', () => {
  const lettersOnly = validatePassword('abcdefgh');
  assert.equal(lettersOnly.criteria.minLength, true);
  assert.equal(lettersOnly.score, 2);
  assert.equal(lettersOnly.isValid, false);
  assert.ok(passwordPolicyError('abcdefgh'));
});

test('validatePassword rejects passwords longer than 72 characters', () => {
  const tooLong = `Aa1${'x'.repeat(70)}`;
  assert.equal(tooLong.length, 73);
  assert.equal(validatePassword(tooLong).isValid, false);
  assert.equal(passwordPolicyError(tooLong), 'Пароль не длиннее 72 символов');
});
