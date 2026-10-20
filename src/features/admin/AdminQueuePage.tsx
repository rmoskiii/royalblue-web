import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import { useAuth } from '@/app/providers/AuthProvider';
import { PageHeader, SegmentedControl, TextField } from '@/components/ui';
import { ApplicationTable } from './ApplicationTable';
import { StaffRecordList } from './StaffRecordList';
import { useStaffListParams } from './useStaffListParams';

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
  const { page, pageSize, q, setQ, query, setListParams } = useStaffListParams();
  const { data } = useQuery({
    queryKey: queryKeys.staff.applications(JSON.stringify({ ...query, tab })),
    queryFn: () =>
      staffService.queue({
        bucket: tab === 'mine' || tab === 'all' ? undefined : tab,
        mine: tab === 'mine',
        q: query.q,
        page: query.page,
        pageSize: query.pageSize,
      }),
  });

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
      <StaffRecordList
        filters={
          <div className="grid gap-3">
            <SegmentedControl
              label="Queue filter"
              value={tab}
              onChange={(id) => {
                const next = new URLSearchParams(params);
                next.set('tab', id);
                next.set('page', '1');
                setParams(next, { replace: true });
              }}
              options={tabs.map((t) => ({ value: t.id, label: t.label }))}
            />
            <TextField
              label="Search"
              placeholder="Application number, name, email, or officer"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        }
        page={page}
        pageSize={pageSize}
        total={data?.total ?? 0}
        empty="Nothing in this queue yet."
        onPageChange={(next) => setListParams({ page: next }, false)}
      >
        <ApplicationTable rows={data?.items} />
      </StaffRecordList>
    </>
  );
}
