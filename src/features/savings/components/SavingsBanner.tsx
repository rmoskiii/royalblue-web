import { useSavingsSummary } from '@/api/hooks';
import { Money } from '@/components/ui';
import { useLiveInterest } from '../hooks/useLiveInterest';

/** PRD View 4 metrics banner: total savings and live accrued interest. */
export function SavingsBanner() {
  const { data } = useSavingsSummary();
  const interest = useLiveInterest(data);

  return (
    <section className="grid gap-5 rounded-card bg-navy bg-[linear-gradient(180deg,rgb(201_60_56/0)_40%,rgb(201_60_56)_256%)] p-5 text-white sm:grid-cols-[1fr_auto] md:px-6.5 md:py-6">
      <div>
        <p className="text-[13px] text-white/75">Total savings</p>
        {data ? (
          <Money
            amount={data.totalBalance}
            decimals={2}
            className="mt-1 block text-[34px] leading-tight font-semibold tracking-tight md:text-[40px]"
          />
        ) : (
          <div className="mt-2 h-10 w-56 animate-pulse rounded-lg bg-white/10" />
        )}
      </div>
      {data && (
        <dl className="grid grid-cols-2 gap-5 self-end sm:text-right">
          <div>
            <dt className="text-[13px] text-white/75">Interest earned</dt>
            <dd className="text-lg font-semibold" aria-live="off">
              +<Money amount={interest} decimals={2} />
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-white/75">Interest rate</dt>
            <dd className="text-lg font-semibold">{Math.round(data.annualRate * 100)}% p.a.</dd>
          </div>
        </dl>
      )}
    </section>
  );
}
