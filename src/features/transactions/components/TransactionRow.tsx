import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { Transaction } from '@/api/types';
import { Chip, Money } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/format';

export function TransactionIcon({ credit, large }: { credit: boolean; large?: boolean }) {
  const Icon = credit ? ArrowDownLeft : ArrowUpRight;
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center',
        large ? 'size-13 rounded-2xl' : 'size-10 rounded-xl',
        credit ? 'bg-success-soft text-success' : 'bg-primary-soft text-primary-text',
      )}
    >
      <Icon className={large ? 'size-6' : 'size-4'} />
    </span>
  );
}

export function TransactionRow({
  transaction: t,
  onSelect,
}: {
  transaction: Transaction;
  onSelect: (t: Transaction) => void;
}) {
  const credit = t.direction === 'credit';
  return (
    <button
      type="button"
      onClick={() => onSelect(t)}
      className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-2"
    >
      <TransactionIcon credit={credit} />
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <span className="truncate">{t.title}</span>
          {t.status === 'pending' && <Chip tone="warning">Pending</Chip>}
          {t.status === 'failed' && <Chip tone="danger">Failed</Chip>}
        </span>
        <span className="block truncate text-xs text-ink-3">
          {t.counterparty} · {formatTime(t.createdAt)}
        </span>
      </span>
      <Money
        amount={credit ? t.amount : -t.amount}
        signed
        className={cn('font-semibold', credit && 'text-success')}
      />
    </button>
  );
}
