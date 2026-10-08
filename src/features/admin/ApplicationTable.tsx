import { Link } from 'react-router';
import { Chip } from '@/components/ui';
import type { CreditFile } from '@/api/types';
import { formatNaira } from '@/lib/format';
import { applicantName, statusTone } from './staffAccess';

export function ApplicationTable({ rows }: { rows: CreditFile[] | undefined }) {
  return (
    <>
      <div className="hidden overflow-x-auto rounded-card border border-line md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface-2 text-[13px] text-ink-3">
            <tr>
              <th className="px-4 py-3 font-medium">Application</th>
              <th className="px-4 py-3 font-medium">Applicant</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Officer</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link to={`/admin/applications/${row.id}`} className="font-medium text-primary-text">
                    {row.applicationNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">{applicantName(row)}</td>
                <td className="px-4 py-3">{row.loanProduct?.name}</td>
                <td className="px-4 py-3 tabular">{formatNaira(Number(row.requestedAmount))}</td>
                <td className="px-4 py-3 text-ink-2">{row.assignedOfficer?.email ?? 'Unassigned'}</td>
                <td className="px-4 py-3">
                  <Chip tone={statusTone(row.status)}>{row.status.replaceAll('_', ' ')}</Chip>
                </td>
              </tr>
            ))}
            {rows?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-3">
                  Nothing in this queue yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ul className="grid gap-2 md:hidden">
        {(rows ?? []).map((row) => (
          <li key={row.id}>
            <Link
              to={`/admin/applications/${row.id}`}
              className="grid gap-1 rounded-card border border-line bg-surface px-4 py-3"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="min-w-0 font-semibold">{applicantName(row)}</span>
                <Chip tone={statusTone(row.status)}>{row.status.replaceAll('_', ' ')}</Chip>
              </span>
              <span className="text-[13px] text-ink-2">{row.applicationNumber}</span>
              <span className="text-[13px] text-ink-3">
                {row.loanProduct?.name} · {formatNaira(Number(row.requestedAmount))}
              </span>
            </Link>
          </li>
        ))}
        {rows?.length === 0 && (
          <li className="rounded-card border border-line px-4 py-8 text-center text-ink-3">
            Nothing in this queue yet.
          </li>
        )}
      </ul>
    </>
  );
}
