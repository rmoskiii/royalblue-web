import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useAccount, useVerificationStatus } from '@/api/hooks';
import { paths } from '@/components/layout/navigation';
import { buttonClass } from '@/components/ui';
import { formatNaira } from '@/lib/format';

export function TierBanner() {
  const { data: status } = useVerificationStatus();
  const { data: account } = useAccount();
  if (!status) return null;

  const restricted = Boolean(status.restrictedNoBvn || account?.restrictedNoBvn);
  const incomplete = status.completedSteps.length < 3 || restricted;
  if (!incomplete) return null;

  const cap = status.limits?.maxBalance ?? account?.maxBalance ?? 50_000;

  return (
    <section className="flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-card border border-amber-500/30 bg-amber-500/10 px-4 py-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-200">
        {restricted ? <ShieldAlert className="size-5" /> : <ShieldCheck className="size-5" />}
      </span>
      <div className="min-w-0 flex-[1_1_220px]">
        <p className="font-semibold">
          {restricted ? `Starter limit ${formatNaira(cap)} — add BVN` : `Finish KYC · Tier ${status.tier}`}
        </p>
        <p className="text-[13px] text-ink-2">
          {restricted
            ? 'You skipped identity checks. CBN starter KYC caps balance, daily send and a single transfer at ₦50,000 until BVN or NIN is linked.'
            : (status.missing?.[0] ??
              'Complete ID and proof of address to raise your limits.')}
        </p>
      </div>
      <Link to={paths.verification} className={buttonClass({ variant: 'secondary' })}>
        {restricted ? 'Add BVN' : 'Continue KYC'}
      </Link>
    </section>
  );
}
