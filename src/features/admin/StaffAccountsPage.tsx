import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import { Button, Card, Chip, PageHeader, SelectField, TextField } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { applicantName } from './staffAccess';
import { StaffRecordList } from './StaffRecordList';
import { useStaffListParams } from './useStaffListParams';

export function StaffAccountsPage() {
  const queryClient = useQueryClient();
  const { page, pageSize, q, status, query, setListParams } = useStaffListParams({ status: 'all' });
  const { data } = useQuery({
    queryKey: queryKeys.staff.accounts(JSON.stringify(query)),
    queryFn: () => staffService.accounts({ ...query, status: query.status === 'all' ? undefined : query.status }),
  });
  const [reason, setReason] = useState('');
  const [target, setTarget] = useState<string | null>(null);

  const freeze = useMutation({
    mutationFn: () => staffService.freeze(target!, reason),
    onSuccess: () => {
      setReason('');
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: ['staff', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.summary });
    },
  });
  const unfreeze = useMutation({
    mutationFn: (id: string) => staffService.unfreeze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', 'accounts'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.summary });
    },
  });

  return (
    <>
      <PageHeader
        title="Accounts"
        subtitle="Freeze or lift holds on customer wallets. Search and filter stay on the list."
      />
      <StaffRecordList
        filters={
          <div className="grid gap-3 md:grid-cols-2">
            <TextField
              label="Search"
              placeholder="Name, email, NUBAN, or freeze reason"
              value={q}
              onChange={(e) => setListParams({ q: e.target.value })}
            />
            <SelectField
              label="Status"
              value={status || 'all'}
              onChange={(e) => setListParams({ status: e.target.value })}
              options={[
                { value: 'all', label: 'All' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'FROZEN', label: 'Frozen' },
                { value: 'CLOSED', label: 'Closed' },
              ]}
            />
          </div>
        }
        page={page}
        pageSize={pageSize}
        total={data?.total ?? 0}
        empty="No customer accounts match these filters."
        onPageChange={(next) => setListParams({ page: next }, false)}
      >
        {(data?.items ?? []).map((row) => {
          const frozen = row.status === 'FROZEN';
          return (
            <Card key={row.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-semibold">{row.accountName || applicantName(row)}</p>
                <p className="text-[13px] text-ink-2">
                  {row.accountNumber} · {formatNaira(Number(row.availableBalance ?? 0))}
                </p>
                {row.applicant?.user?.email && (
                  <p className="text-[13px] text-ink-3">{row.applicant.user.email}</p>
                )}
                {row.freezeReason && <p className="mt-1 text-[13px] text-ink-3">{row.freezeReason}</p>}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={frozen ? 'danger' : 'success'}>{frozen ? 'Frozen' : 'Active'}</Chip>
                {frozen ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={unfreeze.isPending}
                    onClick={() => unfreeze.mutate(row.id)}
                  >
                    Unfreeze
                  </Button>
                ) : target === row.id ? (
                  <div className="flex w-full min-w-0 flex-col gap-2 sm:w-[220px]">
                    <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} />
                    <div className="flex gap-2">
                      <Button size="sm" disabled={!reason || freeze.isPending} onClick={() => freeze.mutate()}>
                        Confirm freeze
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setTarget(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => setTarget(row.id)}>
                    Freeze
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </StaffRecordList>
    </>
  );
}
