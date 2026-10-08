import { Gift, Landmark, Send, ShieldCheck, Wallet } from 'lucide-react';
import { Link } from 'react-router';
import { useMe, useTransactions } from '@/api/hooks';
import { paths } from '@/components/layout/navigation';
import { Card, PageHeader, ProgressBar, buttonClass } from '@/components/ui';
import { cn } from '@/lib/cn';

const TIERS = [
  { name: 'Starter', points: 0 },
  { name: 'Silver', points: 200 },
  { name: 'Gold', points: 500 },
] as const;

export function RewardsPage() {
  const { data: me } = useMe();
  const { data: transactions = [] } = useTransactions({});
  const done = transactions.filter((txn) => txn.status === 'successful');
  const points = done.reduce((sum, txn) => sum + (txn.direction === 'credit' ? 15 : 8), 0);
  const next = TIERS.find((tier) => points < tier.points) ?? TIERS[TIERS.length - 1];
  const current = [...TIERS].reverse().find((tier) => points >= tier.points) ?? TIERS[0];
  const span = next.points === current.points ? 1 : next.points - current.points;
  const progress = next.points === current.points ? 1 : (points - current.points) / span;

  return (
    <div className="mx-auto grid min-w-0 max-w-xl gap-4">
      <PageHeader
        title="Rewards"
        subtitle="A preview from your real activity. Cashback isn’t paying out yet."
      />
      <Card className="relative overflow-hidden bg-navy p-5 text-white">
        <p className="text-[13px] text-white/70">{me?.firstName ? `${me.firstName}’s points` : 'Your points'}</p>
        <p className="mt-1 text-4xl font-semibold tabular">{points}</p>
        <p className="mt-2 text-[13px] text-white/78">
          {current.name}
          {next.points > points ? ` · ${next.points - points} to ${next.name}` : ' · top tier on this preview'}
        </p>
        <div className="mt-4">
          <ProgressBar
            label="Progress to next rewards tier"
            value={Math.min(1, Math.max(0, progress))}
            className="bg-white/15"
          />
        </div>
      </Card>

      <Card className="min-w-0 overflow-hidden p-0">
        <p className="px-4.5 pt-4 text-sm font-semibold">How points are counted</p>
        <ul className="divide-y divide-line">
          <EarnRow icon={Wallet} label="Money in" value="15 pts" />
          <EarnRow icon={Send} label="Money out" value="8 pts" />
        </ul>
        <p className="px-4.5 py-3 text-[13px] text-ink-3">
          Pending or failed sends don’t count. When the live programme starts, these points will not
          convert automatically.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Link to={paths.refer} className={cn(buttonClass({ variant: 'secondary' }), 'justify-center')}>
          <Gift className="size-4" /> Invite
        </Link>
        <Link
          to={paths.verification}
          className={cn(buttonClass({ variant: 'secondary' }), 'justify-center')}
        >
          <ShieldCheck className="size-4" /> Limits
        </Link>
      </div>
      <Link to={paths.loans} className="text-center text-[13px] text-ink-3 hover:text-brand">
        <Landmark className="mr-1 inline size-3.5" />
        Loans and savings still earn in the usual way — not as points.
      </Link>
    </div>
  );
}

function EarnRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center gap-3 px-4.5 py-3">
      <Icon className="size-4 text-brand" strokeWidth={1.8} />
      <span className="min-w-0 flex-1 text-sm">{label}</span>
      <span className="text-sm font-semibold tabular">{value}</span>
    </li>
  );
}
