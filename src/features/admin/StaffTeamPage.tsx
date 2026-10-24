import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { queryKeys } from '@/api/hooks';
import type { StaffRole } from '@/api/types';
import { staffService } from '@/api/services/staff';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { env } from '@/config/env';
import { Button, Card, Chip, PageHeader, SelectField, TextField } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { StaffRecordList } from './StaffRecordList';
import { staffRoleLabel } from './staffAccess';
import { useStaffListParams } from './useStaffListParams';

const emptyInvite = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'LOAN_OFFICER' as StaffRole,
};

export function StaffTeamPage() {
  const { session } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const { page, pageSize, q, setQ, status, setListParams } = useStaffListParams({ status: 'all' });
  const [invite, setInvite] = useState(emptyInvite);
  const { data: rows, isLoading } = useQuery({
    queryKey: queryKeys.staff.team,
    queryFn: staffService.team,
  });
  const add = useMutation({
    mutationFn: () => staffService.invite(invite),
    onSuccess: (result) => {
      showToast(
        env.useMocks && result.otp
          ? `Invite sent. Code ${result.otp}`
          : result.message ?? 'Invite sent. They finish at /staff-join.',
      );
      setInvite(emptyInvite);
      void queryClient.invalidateQueries({ queryKey: queryKeys.staff.team });
    },
    onError: (error: Error) => showToast(error.message),
  });
  const canInvite = session?.user.role === 'ADMINISTRATOR';
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
        subtitle="Loan officers originate. Credit managers decide. Administrators invite desk logins (no BVN) so freeze and decisions show who acted."
      />
      {canInvite && (
        <Card className="mb-4 p-4">
          <h2 className="mb-3 font-semibold">Invite staff</h2>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              add.mutate();
            }}
          >
            <TextField
              label="First name"
              value={invite.firstName}
              onChange={(e) => setInvite((row) => ({ ...row, firstName: e.target.value }))}
              required
            />
            <TextField
              label="Last name"
              value={invite.lastName}
              onChange={(e) => setInvite((row) => ({ ...row, lastName: e.target.value }))}
              required
            />
            <TextField
              label="Work email"
              type="email"
              value={invite.email}
              onChange={(e) => setInvite((row) => ({ ...row, email: e.target.value }))}
              required
            />
            <TextField
              label="Phone"
              type="tel"
              value={invite.phone}
              onChange={(e) => setInvite((row) => ({ ...row, phone: e.target.value }))}
              required
            />
            <SelectField
              label="Role"
              value={invite.role}
              onChange={(e) => setInvite((row) => ({ ...row, role: e.target.value as StaffRole }))}
              options={[
                { value: 'LOAN_OFFICER', label: 'Loan officer' },
                { value: 'CREDIT_MANAGER', label: 'Credit manager' },
                { value: 'ADMINISTRATOR', label: 'Administrator' },
              ]}
            />
            <div className="flex items-end">
              <Button type="submit" disabled={add.isPending}>
                {add.isPending ? 'Sending…' : 'Send invite'}
              </Button>
            </div>
          </form>
        </Card>
      )}
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
        isLoading={isLoading}
        empty="No team members match these filters."
        onPageChange={(next) => setListParams({ page: next }, false)}
      >
        {paged.map((member) => (
          <Card key={member.id} className="flex flex-wrap items-center justify-between gap-3 overflow-visible p-4">
            <div className="min-w-0">
              <p className="font-semibold">
                {[member.firstName, member.lastName].filter(Boolean).join(' ') || member.email}
              </p>
              <p className="text-[13px] text-ink-3">
                {member.email}
                {member.phone ? ` · ${member.phone}` : ''} · Added {formatDate(member.createdAt)}
              </p>
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
