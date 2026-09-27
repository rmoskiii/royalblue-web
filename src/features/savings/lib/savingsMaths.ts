const MS_PER_YEAR = 365 * 24 * 60 * 60 * 1000;

/** Simple daily-style accrual between two moments, for the live interest readout. */
export function accruedSince(balance: number, annualRate: number, fromMs: number, toMs: number) {
  return (balance * annualRate * Math.max(toMs - fromMs, 0)) / MS_PER_YEAR;
}

/**
 * Yield calculator (PRD View 4): a fixed monthly contribution, compounded
 * monthly, paid at the end of each month.
 * TODO(api): confirm the compounding rule the bank uses.
 */
export function projectSavings(monthly: number, months: number, annualRate: number) {
  const r = annualRate / 12;
  const total = r === 0 ? monthly * months : monthly * (((1 + r) ** months - 1) / r);
  const contributed = monthly * months;
  return { contributed, interest: total - contributed, total };
}
