import { Link } from 'react-router';
import { Chip } from '@/components/ui';
import type { CreditFile } from '@/api/types';
import { formatNaira } from '@/lib/format';
import { applicantName, statusTone } from './staffAccess';

export function ApplicationTable({ rows }: { rows: CreditFile[] | undefined }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
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
  );
}
