import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import { Card, Chip, PageHeader, SelectField, TextField } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { StaffRecordList } from './StaffRecordList';
import { staffRoleLabel } from './staffAccess';
import { useStaffListParams } from './useStaffListParams';

export function StaffTeamPage() {
  const { page, pageSize, q, setQ, status, setListParams } = useStaffListParams({ status: 'all' });
  const { data: rows } = useQuery({
    queryKey: queryKeys.staff.team,
    queryFn: staffService.team,
  });
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter((member) => {
      if (status && status !== 'all' && member.role !== status) return false;
      if (needle && !member.email.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [rows, q, status]);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <PageHeader
        title="Credit team"
        subtitle="Loan officers originate. Credit managers decide. Administrators see the whole desk."
      />
      <StaffRecordList
        filters={
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Search"
              placeholder="Email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <SelectField
              label="Role"
              value={status || 'all'}
              onChange={(e) => setListParams({ status: e.target.value })}
              options={[
                { value: 'all', label: 'All' },
                { value: 'LOAN_OFFICER', label: 'Loan officer' },
                { value: 'CREDIT_MANAGER', label: 'Credit manager' },
                { value: 'ADMINISTRATOR', label: 'Administrator' },
              ]}
            />
          </div>
        }
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        empty="No team members match these filters."
        onPageChange={(next) => setListParams({ page: next }, false)}
      >
        {paged.map((member) => (
          <Card key={member.id} className="flex flex-wrap items-center justify-between gap-3 overflow-visible p-4">
            <div className="min-w-0">
              <p className="font-semibold">{member.email}</p>
              <p className="text-[13px] text-ink-3">Added {formatDate(member.createdAt)}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Chip>{staffRoleLabel[member.role]}</Chip>
              <Chip tone={member.isEmailActive ? 'success' : 'warning'}>
                {member.isEmailActive ? 'Active' : 'Pending email'}
              </Chip>
            </div>
          </Card>
        ))}
      </StaffRecordList>
    </>
  );
}
