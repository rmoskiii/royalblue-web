import { useEffect, useState, type FormEvent, type Ref } from 'react';
import { Link } from 'react-router';
import type { LoanProduct, RepaymentFrequency } from '@/api/types';
import { paths } from '@/components/layout/navigation';
import { Button, Card, Money, SelectField, TextField, buttonClass } from '@/components/ui';
import { formatNaira, parseAmount } from '@/lib/format';
import {
  ALLOWED_LOAN_TENORS,
  DEFAULT_EQUITY_PERCENT,
  estimateFacility,
  LOAN_TYPES,
  MAX_OFFERED_RATE_PA,
  repaymentLabel,
} from '../lib/amortization';

interface LoanCalculatorProps {
  products: LoanProduct[];
  selectedProductId?: string;
  ref?: Ref<HTMLDivElement>;
}

type Quote = {
  instalment: number;
  total: number;
  interest: number;
  amount: number;
  tenor: number;
  ratePA: number;
  productId: string;
  frequency: RepaymentFrequency;
};

export function LoanCalculator({ products, selectedProductId, ref }: LoanCalculatorProps) {
  const [frequency, setFrequency] = useState<RepaymentFrequency>('MONTHLY');
  const [productId, setProductId] = useState(selectedProductId ?? '');
  const [amountInput, setAmountInput] = useState('');
  const [rateInput, setRateInput] = useState('');
  const [tenor, setTenor] = useState(3);
  const [amountError, setAmountError] = useState('');
  const [rateError, setRateError] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);

  const product = products.find((row) => row.id === productId);
  const tenorOptions = product?.tenorOptions?.length ? product.tenorOptions : [...ALLOWED_LOAN_TENORS];

  useEffect(() => {
    if (!selectedProductId) return;
    setProductId(selectedProductId);
    setQuote(null);
  }, [selectedProductId]);

  useEffect(() => {
    const next = products.find((row) => row.id === productId);
    const options = next?.tenorOptions ?? [...ALLOWED_LOAN_TENORS];
    setTenor((current) => (options.includes(current) ? current : options[0] ?? 3));
    if (next) {
      setRateInput((current) => (current.trim() === '' ? String(next.indicativeRatePA) : current));
    }
  }, [productId, products]);

  const rangeHint = product
    ? `* Starting from ${formatNaira(product.minAmount, 2)} - ${formatNaira(product.maxAmount, 2)}`
    : undefined;

  function onCalculate(e: FormEvent) {
    e.preventDefault();
    if (!product) {
      setAmountError('Choose a loan category.');
      setQuote(null);
      return;
    }
    const amount = parseAmount(amountInput);
    if (amount < product.minAmount || amount > product.maxAmount) {
      setAmountError(`Enter an amount between ${formatNaira(product.minAmount)} and ${formatNaira(product.maxAmount)}.`);
      setQuote(null);
      return;
    }
    const ratePA = Number(rateInput);
    if (!Number.isFinite(ratePA) || ratePA < 0 || ratePA > MAX_OFFERED_RATE_PA) {
      setRateError(`Offer a rate between 0% and ${MAX_OFFERED_RATE_PA}% p.a.`);
      setQuote(null);
      return;
    }
    setAmountError('');
    setRateError('');
    const months = tenorOptions.includes(tenor) ? tenor : tenorOptions[0] ?? 3;
    const estimate = estimateFacility(amount, ratePA, months, frequency);
    setQuote({
      instalment: estimate.instalment,
      total: estimate.total,
      interest: estimate.interest,
      amount,
      tenor: months,
      ratePA,
      productId: product.id,
      frequency,
    });
  }

  return (
    <Card ref={ref}>
      <h2 className="text-lg font-semibold text-primary">Loan calculator</h2>
      <span className="mt-1 mb-3 block h-1 w-10 rounded-full bg-warning" aria-hidden />
      <p className="mb-4 text-[13px] text-ink-2">
        Note: Risk assessment may influence (the total) repayment amount.
      </p>

      <form className="grid gap-4" onSubmit={onCalculate}>
        <SelectField
          label="Choose Loan Type"
          value={frequency}
          onChange={(e) => {
            setFrequency(e.target.value as RepaymentFrequency);
            setQuote(null);
          }}
          options={LOAN_TYPES}
        />
        <SelectField
          label="Loan Category"
          value={productId}
          placeholder=" "
          onChange={(e) => {
            setProductId(e.target.value);
            setAmountError('');
            setQuote(null);
          }}
          options={products.map((row) => ({ value: row.id, label: row.name }))}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField
            label="Loan Amount (₦)"
            inputMode="numeric"
            value={amountInput}
            error={amountError}
            onChange={(e) => {
              setAmountInput(e.target.value.replace(/[^\d]/g, ''));
              setAmountError('');
              setQuote(null);
            }}
          />
          <SelectField
            label="Loan Duration"
            value={String(tenor)}
            onChange={(e) => {
              setTenor(Number(e.target.value));
              setQuote(null);
            }}
            options={tenorOptions.map((months) => ({
              value: String(months),
              label: `${months} months`,
            }))}
          />
        </div>
        {!amountError && rangeHint ? (
          <p className="-mt-2 text-xs text-primary-text sm:max-w-[50%]">{rangeHint}</p>
        ) : null}
        <TextField
          label="Interest Rate you are offering (% p.a.)"
          type="number"
          min={0}
          max={MAX_OFFERED_RATE_PA}
          step={0.5}
          value={rateInput}
          error={rateError}
          onChange={(e) => {
            setRateInput(e.target.value);
            setRateError('');
            setQuote(null);
          }}
          hint={
            product
              ? `Catalogue for this category is ${product.indicativeRatePA}% p.a. You can offer another rate; credit approves or declines.`
              : `0% to ${MAX_OFFERED_RATE_PA}% p.a. Choosing a category fills the catalogue rate as a starting point.`
          }
        />
        <div className="flex justify-center">
          <Button type="submit" size="lg">
            Calculate
          </Button>
        </div>
      </form>

      {quote && (
        <div className="mt-4 grid gap-2.5 rounded-tile bg-surface-2 p-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 text-[13px] text-ink-2">{repaymentLabel(quote.frequency)}</span>
            <Money amount={quote.instalment} className="shrink-0 text-xl font-semibold text-brand sm:text-[26px]" />
          </div>
          <div className="flex justify-between gap-3 text-[13px] text-ink-2">
            <span>Total repayment</span>
            <Money amount={quote.total} className="shrink-0 font-semibold text-ink" />
          </div>
          <div className="flex justify-between gap-3 text-[13px] text-ink-2">
            <span>Total interest</span>
            <Money amount={quote.interest} className="shrink-0 font-semibold text-ink" />
          </div>
          <Link
            to={`${paths.loanApply}?product=${quote.productId}&amount=${quote.amount}&tenor=${quote.tenor}&rate=${quote.ratePA}&equity=${DEFAULT_EQUITY_PERCENT}&frequency=${quote.frequency}`}
            className={buttonClass({ size: 'lg', block: true, className: 'mt-1' })}
          >
            Start application
          </Link>
          <p className="text-xs text-ink-3">
            Reducing-balance estimate on the rate you offered. Credit still approves the facility.
          </p>
        </div>
      )}
    </Card>
  );
}
