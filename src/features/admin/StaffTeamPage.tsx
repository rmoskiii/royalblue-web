import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/api/hooks';
import { staffService } from '@/api/services/staff';
import { Card, Chip, PageHeader } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { staffRoleLabel } from './staffAccess';

export function StaffTeamPage() {
  const { data: rows } = useQuery({
    queryKey: queryKeys.staff.team,
    queryFn: staffService.team,
  });

  return (
    <>
      <PageHeader
        title="Credit team"
        subtitle="Loan officers originate. Credit managers decide. Administrators see the whole desk."
      />
      <div className="grid gap-3">
        {(rows ?? []).map((member) => (
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
      </div>
    </>
  );
}
