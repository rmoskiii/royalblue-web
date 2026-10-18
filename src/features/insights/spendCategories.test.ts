import { describe, expect, it } from 'vitest';
import { monthDelta, padBreakdown, spendColour } from './spendCategories';

describe('monthDelta', () => {
  it('describes spend against last month', () => {
    expect(monthDelta(0, 0)).toBe('Same as last month');
    expect(monthDelta(5_000, 0)).toBe('No spend recorded last month');
    expect(monthDelta(6_000, 4_000)).toBe('50% more than last month');
    expect(monthDelta(2_000, 4_000)).toBe('50% less than last month');
  });
});

describe('spendColour', () => {
  it('pins shopping and food to fixed series slots', () => {
    expect(spendColour('shopping')).toBe('var(--rb-series-1)');
    expect(spendColour('food')).toBe('var(--rb-series-2)');
  });
});

describe('padBreakdown', () => {
  it('keeps empty categories and maps a legacy transfer bucket', () => {
    const rows = padBreakdown([{ category: 'transfer', share: 1 }], 4_000);
    expect(rows).toHaveLength(8);
    expect(rows.find((row) => row.id === 'transfers')).toMatchObject({ amount: 4_000, share: 1 });
    expect(rows.find((row) => row.id === 'food')?.amount).toBe(0);
  });
});
