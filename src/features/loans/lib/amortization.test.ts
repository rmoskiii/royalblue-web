import { describe, expect, it } from 'vitest';
import type { Loan } from '@/api/types';
import { addMonths, EQUITY_CONTRIBUTION, estimateLoan, monthlyPayment, summariseLoan } from './amortization';

const loan: Loan = {
  id: 'ln-1',
  productId: 'salary',
  productName: 'Salary advance',
  principal: 100_000,
  monthlyRate: 0.02,
  tenorMonths: 4,
  disbursedAt: '2026-10-01T00:00:00.000Z',
  firstRepaymentAt: '2026-11-01T00:00:00.000Z',
  repaymentsMade: 1,
  status: 'active',
  autoDebit: true,
};

describe('monthlyPayment', () => {
  it('splits evenly when the rate is zero', () => {
    expect(monthlyPayment(100_000, 0, 4)).toBe(25_000);
  });
});

describe('estimateLoan', () => {
  it('adds equity as 20% of principal', () => {
    const estimate = estimateLoan(100_000, 0, 4);
    expect(estimate.monthly).toBe(25_000);
    expect(estimate.total).toBe(100_000);
    expect(estimate.interest).toBe(0);
    expect(estimate.equity).toBe(100_000 * EQUITY_CONTRIBUTION);
  });
});

describe('summariseLoan', () => {
  it('counts remaining instalments after repayments already made', () => {
    const summary = summariseLoan(loan);
    expect(summary.monthlyPayment).toBe(monthlyPayment(100_000, 0.02, 4));
    expect(summary.leftToRepay).toBe(summary.monthlyPayment * 3);
    expect(summary.progress).toBe(0.25);
    expect(summary.nextDueDate).toEqual(addMonths(new Date(loan.firstRepaymentAt), 1));
  });
});
