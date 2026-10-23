import { describe, expect, it } from 'vitest';
import { authErrorMessage, passwordPolicyError } from './authErrors';

describe('passwordPolicyError', () => {
  it('accepts a password that meets the Cognito policy', () => {
    expect(passwordPolicyError('Str0ng!pass')).toBeNull();
  });
  it.each([
    ['Sh0rt!', 'at least 8'],
    ['NOLOWER1!', 'lowercase'],
    ['noupper1!', 'uppercase'],
    ['NoNumber!', 'number'],
    ['NoSymbol1', 'symbol'],
  ])('rejects %s', (pw, hint) => {
    expect(passwordPolicyError(pw)).toContain(hint);
  });
});

describe('authErrorMessage', () => {
  it('maps known Cognito errors to friendly text', () => {
    const err = Object.assign(new Error('raw'), { name: 'NotAuthorizedException' });
    expect(authErrorMessage(err)).toBe('Incorrect email or password.');
  });
  it('falls back to the error message', () => {
    expect(authErrorMessage(new Error('Something specific'))).toBe('Something specific');
  });
});
