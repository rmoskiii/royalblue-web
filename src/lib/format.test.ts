import { describe, expect, it } from 'vitest';
import {
  formatAccountNumber,
  formatDayLabel,
  formatNaira,
  formatNumber,
  greeting,
  initials,
  parseAmount,
} from './format';

describe('formatNaira', () => {
  it('formats an absolute naira amount', () => {
    expect(formatNaira(12_000_345)).toBe('₦12,000,345');
    expect(formatNaira(-50)).toBe('₦50');
  });
});

describe('parseAmount', () => {
  it('strips grouping and currency noise', () => {
    expect(parseAmount('25,000')).toBe(25_000);
    expect(parseAmount('₦1,200')).toBe(1_200);
    expect(parseAmount('')).toBe(0);
  });
});

describe('formatNumber', () => {
  it('groups thousands without a naira sign', () => {
    expect(formatNumber(25_000)).toBe('25,000');
  });
});

describe('formatAccountNumber', () => {
  it('spaces a 10-digit NUBAN', () => {
    expect(formatAccountNumber('7823456109')).toBe('7823 4561 09');
  });
});

describe('formatDayLabel', () => {
  const now = new Date(2026, 9, 18, 13, 0, 0);

  it('labels today and yesterday from a fixed now', () => {
    expect(formatDayLabel(new Date(2026, 9, 18, 8, 0, 0).toISOString(), now)).toBe('Today');
    expect(formatDayLabel(new Date(2026, 9, 17, 8, 0, 0).toISOString(), now)).toBe('Yesterday');
  });
});

describe('greeting', () => {
  it('splits the day at noon and 5pm', () => {
    expect(greeting(new Date(2026, 9, 18, 8))).toBe('Good morning');
    expect(greeting(new Date(2026, 9, 18, 13))).toBe('Good afternoon');
    expect(greeting(new Date(2026, 9, 18, 19))).toBe('Good evening');
  });
});

describe('initials', () => {
  it('takes the first two name parts', () => {
    expect(initials('Chiamaka Okafor')).toBe('CO');
    expect(initials('Chike')).toBe('C');
  });
});
