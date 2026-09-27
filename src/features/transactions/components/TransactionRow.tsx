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

/**
 * Phones: icon · title/meta · amount.
 * md and up: a table-style row with separate time and status columns (PRD View 1).
 */
export function TransactionRow({
  transaction: t,
  onSelect,
}: {
  transaction: Transaction;
  onSelect: (t: Transaction) => void;
}) {
  const credit = t.direction === 'credit';
  const status = statusChip[t.status];
  return (
    <button
      type="button"
      onClick={() => onSelect(t)}
      className="grid w-full grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-surface-2 md:grid-cols-[40px_minmax(0,1.5fr)_minmax(0,0.8fr)_96px_minmax(96px,auto)]"
    >
      <TransactionIcon credit={credit} />
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-2 font-medium">
          <span className="truncate">{t.title}</span>
          {t.status !== 'successful' && (
            <Chip tone={status.tone} className="md:hidden">
              {status.label}
            </Chip>
          )}
        </span>
        <span className="block truncate text-xs text-ink-3">
          {t.counterparty}
          <span className="md:hidden"> · {formatTime(t.createdAt)}</span>
        </span>
      </span>
      <span className="hidden text-[13px] text-ink-2 tabular md:block">
        {formatTime(t.createdAt)}
      </span>
      <span className="hidden md:block">
        <Chip tone={status.tone}>{status.label}</Chip>
      </span>
      <Money
        amount={credit ? t.amount : -t.amount}
        signed
        className={cn('text-right font-semibold', credit && 'text-success')}
      />
    </button>
  );
}

const statusChip = {
  successful: { tone: 'success', label: 'Success' },
  pending: { tone: 'warning', label: 'Pending' },
  failed: { tone: 'danger', label: 'Failed' },
} as const;
