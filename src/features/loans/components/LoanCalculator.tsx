import { useState, type Ref } from 'react';
import { Link } from 'react-router';
import type { LoanProduct } from '@/api/types';
import { paths } from '@/components/layout/navigation';
import { buttonClass, Card, CardHeader, Chip, Money } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { estimateLoan } from '../lib/amortization';

const MIN_AMOUNT = 100_000;
const STEP = 50_000;
const DEFAULT_AMOUNT = 1_500_000;

interface LoanCalculatorProps {
  product: LoanProduct;
  ref?: Ref<HTMLDivElement>;
}

/** Remount with key={product.id} to reset when the product changes. */
export function LoanCalculator({ product, ref }: LoanCalculatorProps) {
  const [amount, setAmount] = useState(Math.min(DEFAULT_AMOUNT, product.maxAmount));
  const [tenor, setTenor] = useState(product.tenorOptions.at(-1) ?? 12);
  const estimate = estimateLoan(amount, product.monthlyRate, tenor);

  const rows = [
    ['Total repayment', estimate.total],
    ['Total interest', estimate.interest],
    ['Equity contribution (20%)', estimate.equity],
  ] as const;

  return (
    <Card ref={ref}>
      <CardHeader title="Repayment calculator" action={<Chip>{product.name}</Chip>} />

      <label htmlFor="loan-amount" className="text-[13px] font-medium text-ink-2">
        How much do you need?
      </label>
      <Money
        amount={amount}
        className="mt-1 block text-[24px] leading-tight font-semibold tracking-tight text-brand sm:text-[30px]"
      />
      <input
        id="loan-amount"
        type="range"
        min={MIN_AMOUNT}
        max={product.maxAmount}
        step={STEP}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="my-2 w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-ink-3">
        <span>{formatNaira(MIN_AMOUNT)}</span>
        <span>{formatNaira(product.maxAmount)}</span>
      </div>

      <p className="mt-3.5 mb-1.5 text-[13px] font-medium text-ink-2">Repay over</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Repayment period">
        {product.tenorOptions.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={tenor === m}
            onClick={() => setTenor(m)}
            className="h-9.5 min-w-14 flex-1 rounded-field border border-line bg-surface font-medium aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary-text"
          >
            {m} mo
          </button>
        ))}
      </div>

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
        to={paths.loanApply}
        className={buttonClass({ size: 'lg', block: true })}
      >
        Start application
      </Link>
      <p className="mt-2.5 text-xs text-ink-3">
        Estimate at {product.monthlyRate * 100}% per month on a reducing balance. Your final rate
        depends on approval.
      </p>
    </Card>
  );
}
