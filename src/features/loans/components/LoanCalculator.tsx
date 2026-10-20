import { useState, type Ref } from 'react';
import { Link } from 'react-router';
import type { LoanProduct } from '@/api/types';
import { paths } from '@/components/layout/navigation';
import { buttonClass, Card, CardHeader, Chip, Money, TextField } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import {
  DEFAULT_EQUITY_PERCENT,
  estimateLoan,
  MAX_EQUITY_PERCENT,
  MAX_LOAN_TENOR_MONTHS,
  MAX_OFFERED_RATE_PA,
  MIN_EQUITY_PERCENT,
  MIN_LOAN_TENOR_MONTHS,
} from '../lib/amortization';

const AMOUNT_STEP = 50_000;
const DEFAULT_AMOUNT = 1_500_000;

interface LoanCalculatorProps {
  product: LoanProduct;
  ref?: Ref<HTMLDivElement>;
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Remount with key={product.id} to reset when the product changes. */
export function LoanCalculator({ product, ref }: LoanCalculatorProps) {
  const minAmount = product.minAmount || AMOUNT_STEP;
  const minTenor = product.minTenorMonths || MIN_LOAN_TENOR_MONTHS;
  const maxTenor = Math.min(product.maxTenorMonths || MAX_LOAN_TENOR_MONTHS, MAX_LOAN_TENOR_MONTHS);
  const [amount, setAmount] = useState(clamp(DEFAULT_AMOUNT, minAmount, product.maxAmount));
  const [tenor, setTenor] = useState(maxTenor);
  const [ratePA, setRatePA] = useState(product.indicativeRatePA || product.monthlyRate * 100 * 12);
  const [equityPercent, setEquityPercent] = useState(DEFAULT_EQUITY_PERCENT);
  const monthlyRate = ratePA / 100 / 12;
  const estimate = estimateLoan(amount, monthlyRate, tenor, equityPercent);

  const rows = [
    ['Total repayment', estimate.total],
    ['Total interest', estimate.interest],
    [`Equity contribution (${equityPercent}%)`, estimate.equity],
  ] as const;

  return (
    <Card ref={ref}>
      <CardHeader title="Repayment calculator" action={<Chip>{product.name}</Chip>} />
      <p className="mb-3 text-[13px] text-ink-2">
        Set the amount, tenor, rate, and equity you want to offer. Credit can still change the facility.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="loan-amount"
          label="How much do you need?"
          inputMode="numeric"
          prefix="₦"
          value={String(amount)}
          onChange={(e) => {
            const n = Number(e.target.value.replace(/[^\d]/g, ''));
            if (Number.isNaN(n)) return;
            setAmount(n);
          }}
          onBlur={() => setAmount(clamp(amount, minAmount, product.maxAmount))}
        />
        <TextField
          id="loan-tenor"
          label="Repay over (months)"
          type="number"
          min={minTenor}
          max={maxTenor}
          value={String(tenor)}
          onChange={(e) => setTenor(Math.round(Number(e.target.value)) || minTenor)}
          onBlur={() => setTenor(clamp(tenor, minTenor, maxTenor))}
          hint={`1 to ${maxTenor} months`}
        />
      </div>

      <input
        type="range"
        min={minAmount}
        max={product.maxAmount}
        step={AMOUNT_STEP}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
        aria-label="Loan amount"
      />
      <div className="flex justify-between text-xs text-ink-3">
        <span>{formatNaira(minAmount)}</span>
        <span>{formatNaira(product.maxAmount)}</span>
      </div>

      <input
        type="range"
        min={minTenor}
        max={maxTenor}
        step={1}
        value={tenor}
        onChange={(e) => setTenor(Number(e.target.value))}
        className="mt-3 w-full accent-primary"
        aria-label="Tenor in months"
      />

      <TextField
        className="mt-3.5"
        id="loan-rate"
        label="Interest rate you are offering"
        type="number"
        min={0}
        max={MAX_OFFERED_RATE_PA}
        step={0.5}
        suffix="% p.a."
        inputClassName="pr-16"
        value={String(ratePA)}
        onChange={(e) => setRatePA(Number(e.target.value))}
        onBlur={() => setRatePA(clamp(ratePA, 0, MAX_OFFERED_RATE_PA))}
        hint={`Catalogue starts at ${product.indicativeRatePA}% p.a. (${(monthlyRate * 100).toFixed(2)}% per month on your offer).`}
      />
      <input
        type="range"
        min={0}
        max={MAX_OFFERED_RATE_PA}
        step={0.5}
        value={ratePA}
        onChange={(e) => setRatePA(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
        aria-label="Offered annual interest rate"
      />

      <TextField
        className="mt-3.5"
        id="loan-equity"
        label="Equity you will hold"
        type="number"
        min={MIN_EQUITY_PERCENT}
        max={MAX_EQUITY_PERCENT}
        step={0.5}
        suffix="%"
        value={String(equityPercent)}
        onChange={(e) => setEquityPercent(Number(e.target.value))}
        onBlur={() => setEquityPercent(clamp(equityPercent, MIN_EQUITY_PERCENT, MAX_EQUITY_PERCENT))}
        hint="0% to 20% of the loan amount, in your RoyalBlue account before disbursement."
      />
      <input
        type="range"
        min={MIN_EQUITY_PERCENT}
        max={MAX_EQUITY_PERCENT}
        step={0.5}
        value={equityPercent}
        onChange={(e) => setEquityPercent(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
        aria-label="Offered equity percent"
      />

      <div className="my-4 grid gap-2.5 rounded-tile bg-surface-2 p-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 text-[13px] text-ink-2">Monthly repayment</span>
          <Money amount={estimate.monthly} className="shrink-0 text-xl font-semibold text-brand sm:text-[26px]" />
        </div>
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3 text-[13px] text-ink-2">
            <span className="min-w-0">{label}</span>
            <Money amount={value} className="shrink-0 font-semibold text-ink" />
          </div>
        ))}
      </div>

      <Link
        to={`${paths.loanApply}?product=${product.id}&amount=${amount}&tenor=${tenor}&rate=${ratePA}&equity=${equityPercent}`}
        className={buttonClass({ size: 'lg', block: true })}
      >
        Start application
      </Link>
      <p className="mt-2.5 text-xs text-ink-3">
        Reducing-balance estimate. This is your proposed terms, not an approved facility.
      </p>
    </Card>
  );
}
