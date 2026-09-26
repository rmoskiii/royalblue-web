import type { Loan } from '@/api/types';
import { Chip } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate, formatNaira } from '@/lib/format';
import { buildSchedule, type InstalmentStatus } from '../lib/amortization';

const statusChip: Record<
  InstalmentStatus,
  { tone: 'success' | 'danger' | 'neutral'; label: string }
> = {
  paid: { tone: 'success', label: 'Paid' },
  due: { tone: 'danger', label: 'Due next' },
  upcoming: { tone: 'neutral', label: 'Upcoming' },
};

export function RepaymentSchedule({ loan }: { loan: Loan }) {
  const rows = buildSchedule(loan);

  return (
    <div className="mt-3.5 max-h-65 overflow-auto rounded-tile border border-line">
      <table className="w-full min-w-[520px] border-collapse text-[13px] tabular">
        <caption className="sr-only">Repayment schedule</caption>
        <thead className="sticky top-0 bg-surface-2 text-[11px] tracking-wider text-ink-3 uppercase">
          <tr className="[&>th]:px-3 [&>th]:py-2.25 [&>th]:text-right [&>th]:font-semibold [&>th:nth-child(-n+2)]:text-left">
            <th scope="col">No.</th>
            <th scope="col">Due date</th>
            <th scope="col">Repayment</th>
            <th scope="col">Principal</th>
            <th scope="col">Interest</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.number}
              className={cn(
                'border-t border-line [&>td]:px-3 [&>td]:py-2.25 [&>td]:text-right [&>td:nth-child(-n+2)]:text-left',
                r.status === 'due' && 'bg-primary-soft',
              )}
            >
              <td>{r.number}</td>
              <td>{formatDate(r.dueDate)}</td>
              <td>{formatNaira(r.payment)}</td>
              <td>{formatNaira(r.principal)}</td>
              <td>{formatNaira(r.interest)}</td>
              <td>
                <Chip tone={statusChip[r.status].tone}>{statusChip[r.status].label}</Chip>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
