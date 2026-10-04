import type { KycTier, TierLimit } from '@/api/types';
import { Chip } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatNaira } from '@/lib/format';

const limit = (value: number | null) => (value === null ? 'Unlimited' : formatNaira(value));

/** PRD §3B tier structure, with the customer's current tier highlighted. */
export function TierLimitsTable({ tiers, current }: { tiers: TierLimit[]; current: KycTier }) {
  return (
    <div className="overflow-x-auto rounded-tile border border-line">
      <table className="w-full min-w-[560px] border-collapse text-[13px] tabular">
        <caption className="sr-only">Account tiers and limits</caption>
        <thead className="bg-surface-2 text-[11px] tracking-wider text-ink-3 uppercase">
          <tr className="[&>th]:px-3.5 [&>th]:py-2.5 [&>th]:text-left [&>th]:font-semibold">
            <th scope="col">Tier</th>
            <th scope="col">What you need</th>
            <th scope="col">Per transfer</th>
            <th scope="col">Daily limit</th>
            <th scope="col">Max balance</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t, i) => (
            <tr
              key={`${t.tier}-${t.restrictedNoBvn ? 'starter' : 'full'}-${i}`}
              aria-current={
                t.restrictedNoBvn
                  ? undefined
                  : t.tier === current
                    ? 'true'
                    : undefined
              }
              className={cn(
                'border-t border-line [&>td]:px-3.5 [&>td]:py-3',
                t.tier === current && !t.restrictedNoBvn && 'bg-primary-soft/60',
              )}
            >
              <td className="font-semibold whitespace-nowrap">
                {t.restrictedNoBvn ? 'Starter' : `Tier ${t.tier}`}{' '}
                {!t.restrictedNoBvn && t.tier === current && (
                  <Chip tone="danger" className="ml-1">
                    You
                  </Chip>
                )}
              </td>
              <td className="text-ink-2">{t.requirements}</td>
              <td>{limit(t.singleTransactionLimit)}</td>
              <td>{limit(t.dailyLimit)}</td>
              <td>{limit(t.maxBalance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
