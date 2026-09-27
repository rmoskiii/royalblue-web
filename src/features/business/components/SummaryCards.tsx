import { Clock3, MonitorSmartphone, TrendingUp, type LucideIcon } from 'lucide-react';
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

/** PRD View 2: three columns on desktop, a single stack on phones. */
export function SummaryCards() {
  const { data } = useBusinessSummary();
  if (!data) return <div className="h-28 animate-pulse rounded-card bg-surface-2" />;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <SummaryCard
        icon={TrendingUp}
        label="Today’s volume"
        value={<Money amount={data.todayVolume} decimals={2} />}
        note="All channels, since midnight"
      />
      <SummaryCard
        icon={Clock3}
        label="Pending payout"
        value={<Money amount={data.pendingPayout} decimals={2} />}
        note="Settles to your account by the next business day"
      />
      <SummaryCard
        icon={MonitorSmartphone}
        label="POS terminals"
        value={`${data.terminalsActive} active`}
        note={`${data.terminalsOnline} online now`}
      />
    </div>
  );
}
