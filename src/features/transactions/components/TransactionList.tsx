import type { Transaction } from '@/api/types';
import { EmptyState } from '@/components/ui';
import { formatDayLabel } from '@/lib/format';
import { TransactionRow } from './TransactionRow';

function groupByDay(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const label = formatDayLabel(t.createdAt);
    groups.set(label, [...(groups.get(label) ?? []), t]);
  }
  return [...groups.entries()];
}

interface TransactionListProps {
  transactions: Transaction[] | undefined;
  isLoading?: boolean;
  onSelect: (t: Transaction) => void;
}

export function TransactionList({ transactions, isLoading, onSelect }: TransactionListProps) {
  if (isLoading) return <TransactionListSkeleton />;
  if (!transactions?.length) return <EmptyState title="No transactions to show" />;

  return (
    <div className="grid gap-2">
      {groupByDay(transactions).map(([day, items]) => (
        <section key={day}>
          <h4 className="px-2 pt-2.5 pb-1 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
            {day}
          </h4>
          {items.map((t) => (
            <TransactionRow key={t.id} transaction={t} onSelect={onSelect} />
          ))}
        </section>
      ))}
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="grid gap-3 p-2" aria-busy="true" aria-label="Loading transactions">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-3">
          <div className="size-10 rounded-xl bg-surface-3" />
          <div className="grid flex-1 gap-2">
            <div className="h-3 w-2/5 rounded bg-surface-3" />
            <div className="h-2.5 w-1/4 rounded bg-surface-2" />
          </div>
          <div className="h-3 w-16 rounded bg-surface-3" />
        </div>
      ))}
    </div>
  );
}
