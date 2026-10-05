import type { KycTier, TierLimit } from '@/api/types';
import { Chip } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatNaira } from '@/lib/format';

const limit = (value: number | null) => (value === null ? 'Unlimited' : formatNaira(value));

function isCurrent(t: TierLimit, current: KycTier, currentRestricted: boolean) {
  return t.restrictedNoBvn ? currentRestricted : t.tier === current && !currentRestricted;
}

function YouChip() {
  return (
    <Chip tone="danger" className="ml-1">
      You
    </Chip>
  );
}

/** PRD §3B tier structure, with the customer's current tier highlighted. */
export function TierLimitsTable({
  tiers,
  current,
  restrictedNoBvn,
}: {
  tiers: TierLimit[];
  current: KycTier;
  restrictedNoBvn?: boolean;
}) {
  const currentRestricted = Boolean(restrictedNoBvn);
  return (
    <>
      <ul className="grid gap-2 md:hidden">
        {tiers.map((t, i) => (
          <li
            key={`${t.tier}-${t.restrictedNoBvn ? 'starter' : 'full'}-${i}`}
            className={cn(
              'rounded-tile border border-line px-4 py-3',
              isCurrent(t, current, currentRestricted) && 'bg-primary-soft/60',
            )}
          >
            <p className="font-semibold">
              {t.restrictedNoBvn ? 'Starter' : `Tier ${t.tier}`}
              {isCurrent(t, current, currentRestricted) && <YouChip />}
            </p>
            <p className="mt-1 text-[13px] text-ink-2">{t.requirements}</p>
            <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[13px] tabular">
              <div>
                <dt className="text-ink-3">Per transfer</dt>
                <dd className="font-medium">{limit(t.singleTransactionLimit)}</dd>
              </div>
              <div>
                <dt className="text-ink-3">Daily</dt>
                <dd className="font-medium">{limit(t.dailyLimit)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-ink-3">Max balance</dt>
                <dd className="font-medium">{limit(t.maxBalance)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-tile border border-line md:block">
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
                aria-current={isCurrent(t, current, currentRestricted) ? 'true' : undefined}
                className={cn(
                  'border-t border-line [&>td]:px-3.5 [&>td]:py-3',
                  isCurrent(t, current, currentRestricted) && 'bg-primary-soft/60',
                )}
              >
                <td className="font-semibold whitespace-nowrap">
                  {t.restrictedNoBvn ? 'Starter' : `Tier ${t.tier}`}{' '}
                  {isCurrent(t, current, currentRestricted) && <YouChip />}
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
    </>
  );
}
