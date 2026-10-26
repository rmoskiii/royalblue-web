import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { queryKeys } from '@/api/hooks';
import type { CreditTeamMember, StaffRole } from '@/api/types';
import { staffService } from '@/api/services/staff';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { env } from '@/config/env';
import { Button, Card, Chip, Modal, PageHeader, SelectField, TextField } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { StaffRecordList } from './StaffRecordList';
import { canManageTeam, staffRoleLabel, staffRoleOptions } from './staffAccess';
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
  const [grant, setGrant] = useState({ email: '', role: 'ADMINISTRATOR' as StaffRole });
  const [pendingRemove, setPendingRemove] = useState<CreditTeamMember | null>(null);
  const { data: rows, isLoading } = useQuery({
    queryKey: queryKeys.staff.team,
    queryFn: staffService.team,
  });
  const refreshTeam = () => queryClient.invalidateQueries({ queryKey: queryKeys.staff.team });
  const add = useMutation({
    mutationFn: () => staffService.invite(invite),
    onSuccess: (result) => {
      showToast(
        env.useMocks && result.otp
          ? `Invite sent. Code ${result.otp}`
          : result.message ?? 'Invite sent. They finish at /staff-join.',
      );
      setInvite(emptyInvite);
      void refreshTeam();
    },
    onError: (error: Error) => showToast(error.message),
  });
  const promote = useMutation({
    mutationFn: () => staffService.grantDeskAccess(grant),
    onSuccess: (result) => {
      showToast(result.message ?? `${result.email} is now ${staffRoleLabel[result.role]}.`);
      setGrant({ email: '', role: 'ADMINISTRATOR' });
      void refreshTeam();
    },
    onError: (error: Error) => showToast(error.message),
  });
  const changeRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: StaffRole }) => staffService.updateRole(id, role),
    onSuccess: (member) => {
      showToast(`${member.email} is now ${staffRoleLabel[member.role]}.`);
      void refreshTeam();
    },
    onError: (error: Error) => showToast(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => staffService.remove(id),
    onSuccess: (result) => {
      showToast(result.message);
      setPendingRemove(null);
      void refreshTeam();
    },
    onError: (error: Error) => showToast(error.message),
  });
  const canEdit = canManageTeam(session?.user.role);
  const adminCount = (rows ?? []).filter((row) => row.role === 'ADMINISTRATOR').length;
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
        subtitle="Loan officers originate. Credit managers decide. Administrators invite new desk logins, or grant any existing account a desk role — including administrator."
      />
      {canEdit && (
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
              options={staffRoleOptions}
            />
            <div className="flex items-end">
              <Button type="submit" disabled={add.isPending}>
                {add.isPending ? 'Sending…' : 'Send invite'}
              </Button>
            </div>
          </form>
        </Card>
      )}
      {canEdit && (
        <Card className="mb-4 p-4">
          <h2 className="mb-1 font-semibold">Add an existing account</h2>
          <p className="mb-3 text-[13px] text-ink-3">
            Use the email they already sign in with. They keep that password and get desk access — including
            administrator, not only loan officer or credit manager.
          </p>
          <form
            className="grid gap-3 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              promote.mutate();
            }}
          >
            <TextField
              label="Existing email"
              type="email"
              value={grant.email}
              onChange={(e) => setGrant((row) => ({ ...row, email: e.target.value }))}
              required
            />
            <SelectField
              label="Role"
              value={grant.role}
              onChange={(e) => setGrant((row) => ({ ...row, role: e.target.value as StaffRole }))}
              options={staffRoleOptions}
            />
            <div className="flex items-end">
              <Button type="submit" disabled={promote.isPending || !grant.email.trim()}>
                {promote.isPending ? 'Updating…' : 'Grant desk access'}
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
                ...staffRoleOptions.map(({ value, label }) => ({
                  value,
                  label: label.split(' — ')[0] ?? label,
                })),
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
        {paged.map((member) => {
          const lastAdmin = member.role === 'ADMINISTRATOR' && adminCount < 2;
          const self = member.id === session?.user.id;
          return (
            <Card key={member.id} className="flex flex-wrap items-end justify-between gap-3 overflow-visible p-4">
              <div className="min-w-0">
                <p className="font-semibold">
                  {[member.firstName, member.lastName].filter(Boolean).join(' ') || member.email}
                </p>
                <p className="text-[13px] text-ink-3">
                  {member.email}
                  {member.phone ? ` · ${member.phone}` : ''} · Added {formatDate(member.createdAt)}
                </p>
              </div>
              <div className="flex min-w-[220px] flex-1 flex-wrap items-end justify-end gap-2">
                {canEdit ? (
                  <SelectField
                    label="Permissions"
                    className="min-w-[220px] flex-1"
                    value={member.role}
                    disabled={changeRole.isPending || lastAdmin}
                    onChange={(e) =>
                      changeRole.mutate({ id: member.id, role: e.target.value as StaffRole })
                    }
                    options={staffRoleOptions}
                  />
                ) : (
                  <Chip>{staffRoleLabel[member.role]}</Chip>
                )}
                <Chip tone={member.isEmailActive ? 'success' : 'warning'}>
                  {member.isEmailActive ? 'Active' : 'Pending email'}
                </Chip>
                {canEdit && (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={self || lastAdmin || remove.isPending}
                    onClick={() => setPendingRemove(member)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </StaffRecordList>
      <Modal
        open={Boolean(pendingRemove)}
        onClose={() => setPendingRemove(null)}
        title="Remove desk login"
      >
        <div className="grid gap-4 px-4 pb-4">
          <p className="text-sm text-ink-2">
            {pendingRemove
              ? `${pendingRemove.email} will lose desk access immediately. Loan files assigned to them stay in the queue unassigned. You can invite this email again later.`
              : ''}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPendingRemove(null)}>
              Keep
            </Button>
            <Button
              disabled={!pendingRemove || remove.isPending}
              onClick={() => pendingRemove && remove.mutate(pendingRemove.id)}
            >
              {remove.isPending ? 'Removing…' : 'Remove'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
