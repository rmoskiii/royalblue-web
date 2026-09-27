import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useVerificationStatus } from '@/api/hooks';
import { paths } from '@/components/layout/navigation';
import { buttonClass } from '@/components/ui';

export function TierBanner() {
  const { data: status } = useVerificationStatus();
  if (!status || status.tier === 3) return null;

  return (
    <section className="flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-card border border-line bg-surface px-4 py-3.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-text">
        <ShieldCheck className="size-5" />
      </span>
      <div className="min-w-0 flex-[1_1_220px]">
        <p className="font-semibold">Upgrade to Tier {status.tier + 1}</p>
        <p className="text-[13px] text-ink-2">
          Finish verification to raise your transfer limits and unlock larger loans.
        </p>
      </div>
      <Link to={paths.verification} className={buttonClass({ variant: 'secondary' })}>
        Upgrade now
      </Link>
    </section>
  );
}
