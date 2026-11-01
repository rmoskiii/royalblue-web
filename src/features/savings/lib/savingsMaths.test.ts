import { describe, expect, it } from 'vitest';
import { projectTermDeposit } from './savingsMaths';

describe('projectTermDeposit', () => {
  it('uses regular MFB tenor rates on a lump sum', () => {
    const six = projectTermDeposit(1_000_000, 6);
    expect(six.annualRate).toBe(0.1);
    expect(six.interest).toBe(50_000);
    expect(six.total).toBe(1_050_000);

    const year = projectTermDeposit(1_000_000, 12);
    expect(year.annualRate).toBe(0.12);
    expect(year.interest).toBe(120_000);
    expect(year.total).toBe(1_120_000);
  });
});
