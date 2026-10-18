import { Clock3, TrendingUp, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBusinessSummary } from '@/api/hooks';
import { Card, Money } from '@/components/ui';

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  note: string;
}) {
  return (
    <Card className="grid gap-1.5">
      <span className="flex items-center gap-2 text-[13px] text-ink-2">
        <Icon className="size-4 text-brand" />
        {label}
      </span>
      <span className="text-[26px] leading-tight font-semibold tracking-tight">{value}</span>
      <span className="text-xs text-ink-3">{note}</span>
    </Card>
  );
}

export function SummaryCards() {
  const { data } = useBusinessSummary();
  if (!data) return <div className="h-28 animate-pulse rounded-card bg-surface-2" />;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <SummaryCard
        icon={TrendingUp}
        label="Today’s inflow"
        value={<Money amount={data.todayVolume} decimals={2} />}
        note="Paid into this account since midnight"
      />
      <SummaryCard
        icon={Clock3}
        label="Pending inbound"
        value={<Money amount={data.pendingPayout} decimals={2} />}
        note="Credits that have not posted yet"
      />
    </div>
  );
}
