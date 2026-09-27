import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { queryKeys, useStaff } from '@/api/hooks';
import { businessService } from '@/api/services/business';
import type { StaffMember } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Avatar, Button, Card, Chip, EmptyState, PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { AddStaffModal } from './components/AddStaffModal';

export function StaffPage() {
  const { data: staff, isLoading } = useStaff();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Staff access"
        subtitle="Cashiers see incoming payment alerts only."
        action={
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" /> Add cashier
          </Button>
        }
      />
      <Card className="mb-4 flex gap-3">
        <ShieldCheck className="size-5 shrink-0 text-success" />
        <p className="text-[13px] text-ink-2">
          <b className="font-semibold text-ink">Read-only access.</b> Cashiers can confirm that a
          customer’s payment has arrived. They can’t send money, see balances, view statements or
          change settings.
        </p>
      </Card>
      <Card className="px-2.5 py-2">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-tile bg-surface-2" />
        ) : !staff?.length ? (
          <EmptyState title="No cashiers yet" />
        ) : (
          <ul>
            {staff.map((m) => (
              <StaffRow key={m.id} member={m} />
            ))}
          </ul>
        )}
      </Card>
      <AddStaffModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}

function StaffRow({ member: m }: { member: StaffMember }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);

  const remove = useMutation({
    mutationFn: () => businessService.removeStaff(m.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.business.staff });
      showToast(`${m.name} no longer has access`);
    },
  });

  return (
    <li className="flex flex-wrap items-center gap-3 border-t border-line px-2 py-3 first:border-t-0">
      <Avatar name={m.name} />
      <div className="min-w-0 flex-[1_1_180px]">
        <p className="flex items-center gap-2 font-medium">
          {m.name}
          <Chip tone={m.status === 'active' ? 'success' : 'warning'}>
            {m.status === 'active' ? 'Active' : 'Invited'}
          </Chip>
        </p>
        <p className="truncate text-xs text-ink-3">
          {m.email} · {m.phone} · added {formatDate(m.addedAt)}
        </p>
      </div>
      <span className="text-xs text-ink-3">Cashier · read-only</span>
      {confirming ? (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setConfirming(false)}>
            Keep
          </Button>
          <Button size="sm" onClick={() => remove.mutate()} disabled={remove.isPending}>
            {remove.isPending ? 'Removing…' : 'Remove access'}
          </Button>
        </div>
      ) : (
        <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
          Remove
        </Button>
      )}
    </li>
  );
}
