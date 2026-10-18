import { describe, expect, it } from 'vitest';
import { passwordIsValid, passwordRules } from './passwordRules';

describe('passwordIsValid', () => {
  it('requires length, upper, digit, and symbol', () => {
    expect(passwordIsValid('Short1!')).toBe(false);
    expect(passwordIsValid('longenough1!')).toBe(false);
    expect(passwordIsValid('Longenough!')).toBe(false);
    expect(passwordIsValid('Longenough1')).toBe(false);
    expect(passwordIsValid('Longenough1!')).toBe(true);
  });

  it('exposes the four rules the signup UI lists', () => {
    expect(passwordRules.map((rule) => rule.label)).toEqual([
      'At least 8 characters',
      'An uppercase letter',
      'A number',
      'A symbol',
    ]);
  });
});
