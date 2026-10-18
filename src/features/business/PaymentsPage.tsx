import { useState } from 'react';
import type { SettlementStatus } from '@/api/types';
import { Card, CardHeader, Money, PageHeader } from '@/components/ui';
import { cn } from '@/lib/cn';
import { LiveBadge } from './components/LiveBadge';
import { SettlementTable } from './components/SettlementTable';
import { useLiveSettlements } from './hooks/useLiveSettlements';

type StatusFilter = 'all' | SettlementStatus;

const pill =
  'h-8.5 shrink-0 rounded-full border border-line bg-surface px-3.5 text-[13px] font-medium text-ink-2 aria-pressed:border-pill-on aria-pressed:bg-pill-on aria-pressed:text-pill-on-ink';

export function PaymentsPage() {
  const { data, isLoading, freshIds } = useLiveSettlements();
  const [status, setStatus] = useState<StatusFilter>('all');

  const rows = (data ?? []).filter((s) => status === 'all' || s.status === status);
  const total = rows.reduce((sum, s) => sum + s.amount, 0);

  return (
    <>
      <PageHeader
        title="Money in"
        subtitle="Transfers paid into your dedicated account number."
      />
      <div className="mb-3 flex flex-wrap gap-x-4 gap-y-2">
        <div role="group" aria-label="Status" className="flex gap-1.5">
          {(['all', 'success', 'pending'] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={status === s}
              onClick={() => setStatus(s)}
              className={cn(pill)}
            >
              {s === 'all' ? 'Any status' : s === 'success' ? 'Success' : 'Pending'}
            </button>
          ))}
        </div>
      </div>
      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-3">
              {rows.length} payment{rows.length === 1 ? '' : 's'} <LiveBadge />
            </span>
          }
          action={<Money amount={total} decimals={2} className="font-semibold" />}
        />
        <SettlementTable settlements={rows} freshIds={freshIds} isLoading={isLoading} />
      </Card>
    </>
  );
}
