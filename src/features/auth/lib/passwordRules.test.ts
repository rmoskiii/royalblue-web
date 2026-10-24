import { describe, expect, it } from 'vitest';
import { passwordIsValid, passwordRules } from './passwordRules';

describe('passwordIsValid', () => {
  it('requires length 12, upper, lower, digit, and symbol', () => {
    expect(passwordIsValid('password123')).toBe(false);
    expect(passwordIsValid('Password1')).toBe(false);
    expect(passwordIsValid('longenough1!')).toBe(false);
    expect(passwordIsValid('Longenough!')).toBe(false);
    expect(passwordIsValid('Longenough1')).toBe(false);
    expect(passwordIsValid('Longenough1!')).toBe(true);
    expect(passwordIsValid('RoyalBlue@2026')).toBe(true);
  });

  it('exposes the five rules the signup UI lists', () => {
    expect(passwordRules.map((rule) => rule.label)).toEqual([
      'At least 12 characters',
      'An uppercase letter',
      'A lowercase letter',
      'A number',
      'A symbol',
    ]);
  });
});
