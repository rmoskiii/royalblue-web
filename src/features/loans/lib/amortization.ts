import type { Loan, RepaymentFrequency } from '@/api/types';

/** Default / maximum equity the customer may offer before disbursement. */
export const EQUITY_CONTRIBUTION = 0.2;
export const MIN_EQUITY_PERCENT = 0;
export const MAX_EQUITY_PERCENT = 20;
export const DEFAULT_EQUITY_PERCENT = 20;
export const ALLOWED_LOAN_TENORS = [3, 6, 12] as const;
export const MIN_LOAN_TENOR_MONTHS = 3;
export const MAX_LOAN_TENOR_MONTHS = 12;
export const MAX_OFFERED_RATE_PA = 60;

export const LOAN_TYPES: { value: RepaymentFrequency; label: string }[] = [
  { value: 'DAILY', label: 'Float — daily' },
  { value: 'WEEKLY', label: 'Float — weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
];

export type InstalmentStatus = 'paid' | 'due' | 'upcoming';

export interface Instalment {
  number: number;
  dueDate: Date;
  payment: number;
  principal: number;
  interest: number;
  balanceAfter: number;
  status: InstalmentStatus;
}

export function periodCount(tenorMonths: number, frequency: RepaymentFrequency = 'MONTHLY') {
  if (frequency === 'DAILY') {
    return tenorMonths === 12 ? 365 : tenorMonths * 30;
  }
  if (frequency === 'WEEKLY') {
    return tenorMonths === 12 ? 52 : Math.round((tenorMonths * 52) / 12);
  }
  return tenorMonths;
}

export function periodRateFromPa(interestRatePA: number, frequency: RepaymentFrequency = 'MONTHLY') {
  const pa = Number(interestRatePA) / 100;
  if (frequency === 'DAILY') return pa / 365;
  if (frequency === 'WEEKLY') return pa / 52;
  return pa / 12;
}

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dueDate(first: Date, index: number, frequency: RepaymentFrequency) {
  if (frequency === 'DAILY') return addDays(first, index);
  if (frequency === 'WEEKLY') return addDays(first, index * 7);
  return addMonths(first, index);
}

/**
 * Fixed instalment on a reducing balance, rounded to the naira.
 */
export function monthlyPayment(principal: number, periodRate: number, periods: number) {
  if (periodRate === 0) return Math.round(principal / periods);
  return Math.round((principal * periodRate) / (1 - (1 + periodRate) ** -periods));
}

export function buildSchedule(loan: Loan): Instalment[] {
  const frequency = loan.repaymentFrequency ?? 'MONTHLY';
  const periods = periodCount(loan.tenorMonths, frequency);
  const payment = monthlyPayment(loan.principal, loan.monthlyRate, periods);
  const first = new Date(loan.firstRepaymentAt);
  let balance = loan.principal;

  return Array.from({ length: periods }, (_, i) => {
    const interest = balance * loan.monthlyRate;
    const principal = payment - interest;
    balance = Math.max(balance - principal, 0);
    const number = i + 1;
    return {
      number,
      dueDate: dueDate(first, i, frequency),
      payment,
      principal: Math.round(principal),
      interest: Math.round(interest),
      balanceAfter: Math.round(balance),
      status:
        number <= loan.repaymentsMade
          ? 'paid'
          : number === loan.repaymentsMade + 1
            ? 'due'
            : 'upcoming',
    };
  });
}

export function summariseLoan(loan: Loan) {
  const frequency = loan.repaymentFrequency ?? 'MONTHLY';
  const periods = periodCount(loan.tenorMonths, frequency);
  const payment = monthlyPayment(loan.principal, loan.monthlyRate, periods);
  const remainingPayments = periods - loan.repaymentsMade;
  const first = new Date(loan.firstRepaymentAt);
  return {
    monthlyPayment: payment,
    totalRepayable: payment * periods,
    leftToRepay: payment * remainingPayments,
    progress: loan.repaymentsMade / periods,
    periods,
    nextDueDate: remainingPayments > 0 ? dueDate(first, loan.repaymentsMade, frequency) : null,
    endDate: dueDate(first, periods - 1, frequency),
  };
}

export function estimateLoan(amount: number, monthlyRate: number, months: number, equityPercent = DEFAULT_EQUITY_PERCENT) {
  const monthly = monthlyPayment(amount, monthlyRate, months);
  const total = monthly * months;
  const percent = Number.isNaN(equityPercent) ? DEFAULT_EQUITY_PERCENT : equityPercent;
  return { monthly, total, interest: total - amount, equity: amount * (percent / 100) };
}

export function estimateFacility(
  amount: number,
  ratePA: number,
  tenorMonths: number,
  frequency: RepaymentFrequency,
  equityPercent = DEFAULT_EQUITY_PERCENT,
) {
  const periods = periodCount(tenorMonths, frequency);
  const rate = periodRateFromPa(ratePA, frequency);
  const instalment = monthlyPayment(amount, rate, periods);
  const total = instalment * periods;
  const percent = Number.isNaN(equityPercent) ? DEFAULT_EQUITY_PERCENT : equityPercent;
  return { instalment, periods, total, interest: total - amount, equity: amount * (percent / 100) };
}

export function repaymentLabel(frequency: RepaymentFrequency) {
  if (frequency === 'DAILY') return 'Daily repayment';
  if (frequency === 'WEEKLY') return 'Weekly repayment';
  return 'Monthly repayment';
}
