import type { KycTier, TierLimit } from '@/api/types';
import { Chip } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatNaira } from '@/lib/format';

const limit = (value: number | null) => (value === null ? 'Unlimited' : formatNaira(value));

function isCurrent(t: TierLimit, current: KycTier, hasBvn: boolean) {
  if (t.tier !== current) return false;
  if (current === 1) return Boolean(t.hasBvn) === hasBvn;
  return true;
}

function YouChip() {
  return (
    <Chip tone="danger" className="shrink-0">
      You
    </Chip>
  );
}

function tierLabel(t: TierLimit) {
  return t.label ?? `Tier ${t.tier}`;
}

/** Account tiers, with the customer's current band highlighted. */
export function TierLimitsTable({
  tiers,
  current,
  hasBvn,
}: {
  tiers: TierLimit[];
  current: KycTier;
  hasBvn?: boolean;
}) {
  const bvnLinked = Boolean(hasBvn);
  return (
    <>
      <ul className="grid min-w-0 gap-2 lg:hidden">
        {tiers.map((t, i) => (
          <li
            key={`${t.tier}-${t.hasBvn ? 'bvn' : 'nin'}-${i}`}
            className={cn(
              'min-w-0 overflow-hidden rounded-tile border border-line px-4 py-3',
              isCurrent(t, current, bvnLinked) && 'bg-primary-soft/60',
            )}
          >
            <p className="flex min-w-0 flex-wrap items-center gap-1 font-semibold">
              {tierLabel(t)}
              {isCurrent(t, current, bvnLinked) && <YouChip />}
            </p>
            <p className="mt-1 text-[13px] break-words text-ink-2">{t.requirements}</p>
            <dl className="mt-2 grid grid-cols-1 gap-y-1 text-[13px] tabular">
              <div className="flex min-w-0 justify-between gap-3">
                <dt className="shrink-0 text-ink-3">Per transfer</dt>
                <dd className="min-w-0 text-right font-medium break-words">{limit(t.singleTransactionLimit)}</dd>
              </div>
              <div className="flex min-w-0 justify-between gap-3">
                <dt className="shrink-0 text-ink-3">Daily</dt>
                <dd className="min-w-0 text-right font-medium break-words">{limit(t.dailyLimit)}</dd>
              </div>
              <div className="flex min-w-0 justify-between gap-3">
                <dt className="shrink-0 text-ink-3">Max balance</dt>
                <dd className="min-w-0 text-right font-medium break-words">{limit(t.maxBalance)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-tile border border-line lg:block">
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
                key={`${t.tier}-${t.hasBvn ? 'bvn' : 'nin'}-${i}`}
                aria-current={isCurrent(t, current, bvnLinked) ? 'true' : undefined}
                className={cn(
                  'border-t border-line [&>td]:px-3.5 [&>td]:py-3',
                  isCurrent(t, current, bvnLinked) && 'bg-primary-soft/60',
                )}
              >
                <td className="font-semibold whitespace-nowrap">
                  {tierLabel(t)} {isCurrent(t, current, bvnLinked) && <YouChip />}
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
