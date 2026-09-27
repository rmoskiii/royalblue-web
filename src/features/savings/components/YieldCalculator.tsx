import { useState } from 'react';
import { Card, CardHeader, Money } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { projectSavings } from '../lib/savingsMaths';

const MIN = 5_000;
const MAX = 500_000;
const STEP = 5_000;
const TENURES = [3, 6, 12];

/** PRD View 4: simulate returns from a monthly contribution over 3, 6 or 12 months. */
export function YieldCalculator({ annualRate }: { annualRate: number }) {
  const [monthly, setMonthly] = useState(50_000);
  const [months, setMonths] = useState(12);
  const { contributed, interest, total } = projectSavings(monthly, months, annualRate);
  const interestShare = interest / total;

  return (
    <Card>
      <CardHeader
        title="Returns calculator"
        action={<span className="text-xs text-ink-3">{Math.round(annualRate * 100)}% p.a.</span>}
      />

      <label htmlFor="yield-monthly" className="text-[13px] font-medium text-ink-2">
        Save each month
      </label>
      <Money
        amount={monthly}
        className="mt-1 block text-[26px] font-semibold tracking-tight text-brand"
      />
      <input
        id="yield-monthly"
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={monthly}
        onChange={(e) => setMonthly(Number(e.target.value))}
        className="my-2 w-full accent-primary"
      />
      <div className="flex justify-between text-xs text-ink-3">
        <span>{formatNaira(MIN)}</span>
        <span>{formatNaira(MAX)}</span>
      </div>

      <p className="mt-3.5 mb-1.5 text-[13px] font-medium text-ink-2">For</p>
      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Savings period">
        {TENURES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={months === m}
            onClick={() => setMonths(m)}
            className="h-9.5 rounded-field border border-line bg-surface font-medium aria-pressed:border-primary aria-pressed:bg-primary-soft aria-pressed:text-primary-text"
          >
            {m} months
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-tile bg-surface-2 p-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[13px] text-ink-2">You’ll have</span>
          <Money amount={total} className="text-[26px] font-semibold text-brand" />
        </div>
        {/* Contributed vs interest, to scale, with a 2px gap between the two fills */}
        <div className="mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          <span
            className="bg-series-1"
            style={{ width: `${(1 - interestShare) * 100}%` }}
            title={`You save ${formatNaira(contributed)}`}
          />
          <span
            className="bg-series-2"
            style={{ width: `${interestShare * 100}%` }}
            title={`Interest ${formatNaira(interest)}`}
          />
        </div>
        <dl className="mt-3 grid gap-1.5 text-[13px]">
          <div className="grid grid-cols-[10px_1fr_auto] items-center gap-2">
            <i className="size-2.5 rounded-[3px] bg-series-1" />
            <dt className="text-ink-2">You save</dt>
            <dd className="font-semibold">
              <Money amount={contributed} />
            </dd>
          </div>
          <div className="grid grid-cols-[10px_1fr_auto] items-center gap-2">
            <i className="size-2.5 rounded-[3px] bg-series-2" />
            <dt className="text-ink-2">Interest earned</dt>
            <dd className="font-semibold">
              <Money amount={interest} />
            </dd>
          </div>
        </dl>
      </div>
      <p className="mt-2.5 text-xs text-ink-3">
        Estimate, compounded monthly. Actual returns depend on when you deposit.
      </p>
    </Card>
  );
}
