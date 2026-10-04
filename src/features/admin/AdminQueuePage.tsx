import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import type { ApplicationStatus } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader, SegmentedControl } from '@/components/ui';
import { ApplicationTable } from './ApplicationTable';
import { intakeStatuses } from './staffAccess';

const officerTabs = [
  { id: 'intake', label: 'Intake' },
  { id: 'mine', label: 'My files' },
  { id: 'credit', label: 'With credit' },
  { id: 'all', label: 'All' },
] as const;

const managerTabs = [
  { id: 'credit', label: 'Decide' },
  { id: 'booked', label: 'Booked' },
  { id: 'declined', label: 'Declined' },
  { id: 'all', label: 'All' },
] as const;

const adminTabs = [
  { id: 'all', label: 'All' },
  { id: 'intake', label: 'Intake' },
  { id: 'credit', label: 'Credit review' },
  { id: 'booked', label: 'Booked' },
] as const;

export function AdminQueuePage() {
  const { session } = useAuth();
  const role = session?.user.role;
  const tabs = role === 'LOAN_OFFICER' ? officerTabs : role === 'CREDIT_MANAGER' ? managerTabs : adminTabs;
  const [params, setParams] = useSearchParams();
  const tab = tabs.some((t) => t.id === params.get('tab')) ? params.get('tab')! : tabs[0].id;

  const { data: rows } = useQuery({
    queryKey: queryKeys.staff.applications('all'),
    queryFn: () => staffService.queue(),
  });

  const filtered = useMemo(() => {
    const list = rows ?? [];
    if (tab === 'intake') return list.filter((row) => intakeStatuses.includes(row.status));
    if (tab === 'mine') return list.filter((row) => row.assignedOfficer?.id === session?.user.id);
    if (tab === 'credit') return list.filter((row) => row.status === 'CREDIT_REVIEW');
    if (tab === 'booked') {
      const booked: ApplicationStatus[] = ['APPROVED', 'APPROVED_WITH_CONDITIONS', 'DISBURSED', 'ACTIVE'];
      return list.filter((row) => booked.includes(row.status));
    }
    if (tab === 'declined') return list.filter((row) => row.status === 'DECLINED');
    return list;
  }, [rows, tab, session?.user.id]);

  return (
    <>
      <PageHeader
        title={role === 'CREDIT_MANAGER' ? 'Credit review' : 'Pipeline'}
        subtitle={
          role === 'LOAN_OFFICER'
            ? 'Claim a file, complete the paper pack, then recommend it.'
            : role === 'CREDIT_MANAGER'
              ? 'Approve or decline files that officers have recommended.'
              : 'Every application across origination and credit.'
        }
      />
      <div className="mb-4">
        <SegmentedControl
          label="Queue filter"
          value={tab}
          onChange={(id) => setParams({ tab: id })}
          options={tabs.map((t) => ({ value: t.id, label: t.label }))}
        />
      </div>
      <ApplicationTable rows={filtered} />
    </>
  );
}
