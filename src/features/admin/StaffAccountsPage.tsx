import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import { Button, Card, Chip, PageHeader, TextField } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { applicantName } from './staffAccess';

export function StaffAccountsPage() {
  const queryClient = useQueryClient();
  const { data: rows } = useQuery({
    queryKey: queryKeys.staff.accounts,
    queryFn: staffService.accounts,
  });
  const [reason, setReason] = useState('');
  const [target, setTarget] = useState<string | null>(null);

  const freeze = useMutation({
    mutationFn: () => staffService.freeze(target!, reason),
    onSuccess: () => {
      setReason('');
      setTarget(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.summary });
    },
  });
  const unfreeze = useMutation({
    mutationFn: (id: string) => staffService.unfreeze(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.accounts });
      queryClient.invalidateQueries({ queryKey: queryKeys.staff.summary });
    },
  });

  return (
    <>
      <PageHeader
        title="Accounts"
        subtitle="Freeze or lift holds on customer wallets when credit or compliance requires it."
      />
      <div className="grid gap-3">
        {(rows ?? []).map((row) => {
          const frozen = row.status === 'FROZEN';
          return (
            <Card key={row.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="font-semibold">{row.accountName || applicantName(row)}</p>
                <p className="text-[13px] text-ink-2">
                  {row.accountNumber} · {formatNaira(Number(row.availableBalance ?? 0))}
                </p>
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
                  <div className="flex min-w-[220px] flex-col gap-2">
                    <TextField
                      label="Reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
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
        {rows?.length === 0 && (
          <Card className="p-6 text-center text-ink-3">No customer accounts yet.</Card>
        )}
      </div>
    </>
  );
}
