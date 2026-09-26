import type { Loan } from '@/api/types';

/** Customers deposit 20% of the loan amount before disbursement (RoyalBlue policy). */
export const EQUITY_CONTRIBUTION = 0.2;

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

export function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Fixed monthly repayment on a reducing balance, rounded to the naira.
 * TODO(api): prefer the schedule returned by the API once available.
 */
export function monthlyPayment(principal: number, monthlyRate: number, months: number) {
  if (monthlyRate === 0) return Math.round(principal / months);
  return Math.round((principal * monthlyRate) / (1 - (1 + monthlyRate) ** -months));
}

export function buildSchedule(loan: Loan): Instalment[] {
  const payment = monthlyPayment(loan.principal, loan.monthlyRate, loan.tenorMonths);
  const first = new Date(loan.firstRepaymentAt);
  let balance = loan.principal;

  return Array.from({ length: loan.tenorMonths }, (_, i) => {
    const interest = balance * loan.monthlyRate;
    const principal = payment - interest;
    balance = Math.max(balance - principal, 0);
    const number = i + 1;
    return {
      number,
      dueDate: addMonths(first, i),
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
  const payment = monthlyPayment(loan.principal, loan.monthlyRate, loan.tenorMonths);
  const remainingPayments = loan.tenorMonths - loan.repaymentsMade;
  const first = new Date(loan.firstRepaymentAt);
  return {
    monthlyPayment: payment,
    totalRepayable: payment * loan.tenorMonths,
    leftToRepay: payment * remainingPayments,
    progress: loan.repaymentsMade / loan.tenorMonths,
    nextDueDate: remainingPayments > 0 ? addMonths(first, loan.repaymentsMade) : null,
    endDate: addMonths(first, loan.tenorMonths - 1),
  };
}

export function estimateLoan(amount: number, monthlyRate: number, months: number) {
  const monthly = monthlyPayment(amount, monthlyRate, months);
  const total = monthly * months;
  return { monthly, total, interest: total - amount, equity: amount * EQUITY_CONTRIBUTION };
}
