import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useAccount, useMe, useVerificationStatus } from '@/api/hooks';
import { isStaffRole } from '@/api/types';
import { paths } from '@/components/layout/navigation';
import { buttonClass } from '@/components/ui';
import { formatNaira } from '@/lib/format';

export function TierBanner() {
  const { data: me } = useMe();
  const { data: status } = useVerificationStatus();
  const { data: account } = useAccount();
  if (isStaffRole(me?.role)) return null;
  if (!status) return null;

  const identityPending =
    Boolean(status.hasBvn || status.hasNin) && status.identityVerified === false;
  // Stay on Home and Me until ID + address unlock Tier 3. The bell is only for new money events.
  if (status.tier >= 3 && !identityPending) return null;

  const cap = status.limits?.dailyLimit ?? account?.dailyLimit ?? 50_000;
  const ninOnly = status.tier === 1 && !status.hasBvn;
  const title = identityPending
    ? 'Identity not confirmed'
    : ninOnly
      ? `Tier 1 · NIN — ${formatNaira(cap)} daily`
      : `Finish verification · Tier ${status.tier}`;
  const body = identityPending
    ? (status.missing?.[0] ??
      'We have not confirmed this identity yet. Keep using the account, then finish verification in Settings.')
    : ninOnly
      ? 'Add BVN to raise daily and per-transfer limits to ₦50,000. Max balance stays ₦300,000 until Tier 2.'
      : (status.missing?.[0] ?? 'Complete ID and proof of address to raise your limits.');
  const cta = identityPending ? 'Finish in Settings' : ninOnly ? 'Add BVN' : 'Continue verification';

  return (
    <section className="flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-card border border-amber-500/30 bg-amber-500/10 px-4 py-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200">
        {ninOnly || identityPending ? (
          <ShieldAlert className="size-5" />
        ) : (
          <ShieldCheck className="size-5" />
        )}
      </span>
      <div className="min-w-0 flex-[1_1_220px]">
        <p className="font-semibold">{title}</p>
        <p className="text-[13px] text-ink-2">{body}</p>
      </div>
      <Link to={paths.verification} className={buttonClass({ variant: 'secondary', className: 'w-full sm:w-auto' })}>
        {cta}
      </Link>
    </section>
  );
}
