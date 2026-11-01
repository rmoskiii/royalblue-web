import { useState } from 'react';
import { cn } from '@/lib/cn';
import { formatNaira } from '@/lib/format';
import { type MfbTermMonths, projectTermDeposit } from '@/features/savings/lib/savingsMaths';

const MIN = 50_000;
const MAX = 10_000_000;
const STEP = 50_000;
const TENURES: MfbTermMonths[] = [3, 6, 12];

/**
 * Welcome-page term-deposit calculator. Matches the Figma card: lump sum + tenor,
 * simple interest at regular MFB rates (8 / 10 / 12% p.a.).
 */
export function LandingSavingsCalculator({
  className,
  fill,
}: {
  className?: string;
  /** Pin controls to the bottom of a fixed-height Figma card. */
  fill?: boolean;
}) {
  const [principal, setPrincipal] = useState(1_000_000);
  const [months, setMonths] = useState<MfbTermMonths>(6);
  const { interest, total, annualRate } = projectTermDeposit(principal, months);

  return (
    <div className={cn('flex min-h-0 flex-col', fill && 'h-full', className)}>
      <p className="inline-flex w-fit items-center self-start rounded-full border border-[#1B194D]/10 bg-white px-3 py-1 text-[11px] font-medium text-[#1B194D]/70">
        Savings Calculator
      </p>
      <h2 className="font-display mt-3 max-w-[16ch] text-[1.75rem] leading-[1.12] tracking-[-0.02em] text-[#1B194D] lg:text-[1.9rem]">
        See how fast your savings grow
      </h2>

      <div className={cn('flex items-end justify-between gap-4', fill ? 'mt-auto pt-4' : 'mt-6')}>
        <label className="min-w-0 flex-1">
          <span className="text-[11px] font-medium tracking-wide text-[#1B194D]/45 uppercase">
            Deposit Amount
          </span>
          <span className="mt-1 block text-[1.15rem] font-semibold text-[#1B194D]">
            {formatNaira(principal)}
          </span>
        </label>
        <label className="shrink-0">
          <span className="sr-only">Tenure</span>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) as MfbTermMonths)}
            className="h-9 rounded-full border border-[#1B194D]/12 bg-[#f6f6f8] px-3 text-[13px] font-medium text-[#1B194D]"
          >
            {TENURES.map((m) => (
              <option key={m} value={m}>
                {m} Months
              </option>
            ))}
          </select>
        </label>
      </div>

      <input
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        value={principal}
        aria-label="Deposit amount"
        onChange={(e) => setPrincipal(Number(e.target.value))}
        className="mt-3 w-full accent-[#C93C38]"
      />

      <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-6 border-t border-[#1B194D]/8 pt-4">
        <div>
          <p className="text-[11px] font-medium tracking-wide text-[#1B194D]/45 uppercase">
            Total Payout at Maturity
          </p>
          <p className="mt-1 font-display text-[2.1rem] leading-none tracking-[-0.03em] text-[#1B194D]">
            {formatNaira(total)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-medium tracking-wide text-[#1B194D]/45 uppercase">
            Estimated Returns
          </p>
          <p className="mt-1 text-[1.35rem] font-semibold text-[#1f9d55]">+{formatNaira(interest)}</p>
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-[#1B194D]/45">
        Estimate at {Math.round(annualRate * 100)}% p.a. simple interest ({months} months). Indicative
        regular MFB term-deposit rates, not a quote.
      </p>
    </div>
  );
}
