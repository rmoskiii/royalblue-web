import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Landmark, Snowflake, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import { isStaffRole } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { Card, PageHeader } from '@/components/ui';
import { paths } from '@/components/layout/navigation';
import { ApplicationTable } from './ApplicationTable';
import { intakeStatuses, staffRoleLabel } from './staffAccess';

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  to,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  note: string;
  to: string;
}) {
  return (
    <Link to={to} className="block">
      <Card className="grid gap-1.5 transition-colors hover:bg-surface-2">
        <span className="flex items-center gap-2 text-[13px] text-ink-2">
          <Icon className="size-4 text-brand" />
          {label}
        </span>
        <span className="text-[26px] leading-tight font-semibold tracking-tight">{value}</span>
        <span className="text-xs text-ink-3">{note}</span>
      </Card>
    </Link>
  );
}

export function StaffDeskPage() {
  const { session } = useAuth();
  const role = session?.user.role;
  const { data: summary } = useQuery({
    queryKey: queryKeys.staff.summary,
    queryFn: staffService.summary,
  });
  const { data: rows } = useQuery({
    queryKey: queryKeys.staff.applications('desk'),
    queryFn: () => staffService.queue(),
  });

  const copy =
    role === 'LOAN_OFFICER'
      ? {
          title: 'Loan officer desk',
          subtitle: 'Complete intake files and send a recommendation to credit.',
        }
      : role === 'CREDIT_MANAGER'
        ? {
            title: 'Credit manager desk',
            subtitle: 'Decide recommended files and keep account freezes in order.',
          }
        : {
            title: 'Operations overview',
            subtitle: 'The full pipeline, customer accounts, and the credit team.',
          };

  const focus =
    role === 'CREDIT_MANAGER'
      ? (rows ?? []).filter((row) => row.status === 'CREDIT_REVIEW')
      : role === 'LOAN_OFFICER'
        ? (rows ?? []).filter((row) => intakeStatuses.includes(row.status))
        : (rows ?? []).slice(0, 8);

  return (
    <>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />
      <div className="grid gap-3 md:grid-cols-3">
        {role === 'LOAN_OFFICER' && (
          <>
            <StatCard
              icon={ClipboardList}
              label="Intake"
              value={summary?.pipeline.intake ?? '—'}
              note="Submitted and in review"
              to={paths.adminQueue}
            />
            <StatCard
              icon={Landmark}
              label="Assigned to me"
              value={summary?.assignedToMe ?? '—'}
              note="Files you have claimed"
              to={`${paths.adminQueue}?tab=mine`}
            />
            <StatCard
              icon={ClipboardList}
              label="With credit"
              value={summary?.pipeline.creditReview ?? '—'}
              note="Waiting on a manager decision"
              to={`${paths.adminQueue}?tab=credit`}
            />
          </>
        )}
        {role === 'CREDIT_MANAGER' && (
          <>
            <StatCard
              icon={ClipboardList}
              label="Ready to decide"
              value={summary?.pipeline.creditReview ?? '—'}
              note="Officer recommendations in"
              to={paths.adminQueue}
            />
            <StatCard
              icon={Snowflake}
              label="Frozen accounts"
              value={summary?.frozenAccounts ?? '—'}
              note="Liens and holds"
              to={paths.adminAccounts}
            />
            <StatCard
              icon={Landmark}
              label="Booked"
              value={summary?.pipeline.disbursed ?? '—'}
              note="Disbursed or active facilities"
              to={`${paths.adminQueue}?tab=booked`}
            />
          </>
        )}
        {isStaffRole(role) && role === 'ADMINISTRATOR' && (
          <>
            <StatCard
              icon={ClipboardList}
              label="Intake"
              value={summary?.pipeline.intake ?? '—'}
              note="Needs an officer"
              to={`${paths.adminQueue}?tab=intake`}
            />
            <StatCard
              icon={ClipboardList}
              label="Credit review"
              value={summary?.pipeline.creditReview ?? '—'}
              note="Needs a decision"
              to={paths.adminQueue}
            />
            <StatCard
              icon={Users}
              label="Team"
              value={summary?.staffHeadcount ?? '—'}
              note={`${summary?.frozenAccounts ?? 0} frozen accounts`}
              to={paths.adminTeam}
            />
          </>
        )}
      </div>
      <div className="mt-5">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-base font-semibold">
            {role === 'CREDIT_MANAGER' ? 'Waiting on you' : role === 'LOAN_OFFICER' ? 'Intake queue' : 'Recent files'}
          </h2>
          <Link to={paths.adminQueue} className="text-[13px] font-medium text-primary-text">
            Open pipeline
          </Link>
        </div>
        <ApplicationTable rows={focus} />
      </div>
      {isStaffRole(role) && (
        <p className="mt-4 text-xs text-ink-3">Signed in as {staffRoleLabel[role]}.</p>
      )}
    </>
  );
}
