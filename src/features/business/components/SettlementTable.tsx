import type { Settlement } from '@/api/types';
import { EmptyState, Money } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatTime } from '@/lib/format';
import { ChannelChip, SettlementStatusChip } from './ChannelChip';

/**
 * Real-time settlement table (PRD View 2): Time, Customer name, Channel,
 * Amount, Status. A table from md up, a stacked list on phones.
 */
export function SettlementTable({
  settlements,
  freshIds = [],
  isLoading,
}: {
  settlements: Settlement[] | undefined;
  freshIds?: string[];
  isLoading?: boolean;
}) {
  if (isLoading)
    return <div className="h-40 animate-pulse rounded-tile bg-surface-2" aria-busy="true" />;
  if (!settlements?.length) return <EmptyState title="No payments yet today" />;

  const rowTone = (id: string) => freshIds.includes(id) && 'bg-success-soft';

  return (
    <>
      {/* md and up */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-[13px]">
          <caption className="sr-only">Incoming payments</caption>
          <thead className="text-[11px] tracking-wider text-ink-3 uppercase">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold">
              <th scope="col">Time</th>
              <th scope="col">Customer</th>
              <th scope="col">Channel</th>
              <th scope="col" className="text-right!">
                Amount
              </th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s) => (
              <tr
                key={s.id}
                className={cn(
                  'border-t border-line transition-colors duration-1000 [&>td]:px-3 [&>td]:py-2.75',
                  rowTone(s.id),
                )}
              >
                <td className="text-ink-2 tabular">{formatTime(s.createdAt)}</td>
                <td className="font-medium">{s.customerName}</td>
                <td>
                  <ChannelChip channel={s.channel} />
                </td>
                <td className="text-right font-semibold">
                  <Money amount={s.amount} decimals={2} />
                </td>
                <td>
                  <SettlementStatusChip status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phones */}
      <ul className="grid md:hidden">
        {settlements.map((s) => (
          <li
            key={s.id}
            className={cn(
              'grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 border-t border-line px-1 py-3 transition-colors duration-1000 first:border-t-0',
              rowTone(s.id),
            )}
          >
            <span className="truncate font-medium">{s.customerName}</span>
            <Money amount={s.amount} decimals={2} className="text-right font-semibold" />
            <span className="flex items-center gap-1.5 text-xs text-ink-3">
              {formatTime(s.createdAt)} · <ChannelChip channel={s.channel} />
            </span>
            <span className="text-right">
              <SettlementStatusChip status={s.status} />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}
