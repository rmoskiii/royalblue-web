import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useStaff } from '@/api/hooks';
import { useProfile } from '@/app/providers/ProfileProvider';
import { PosStatusPill } from '@/components/layout/PosStatusPill';
import { paths } from '@/components/layout/navigation';
import { Button, Card, CardHeader, PageHeader } from '@/components/ui';
import { AddStaffModal } from './components/AddStaffModal';
import { LiveBadge } from './components/LiveBadge';
import { SettlementTable } from './components/SettlementTable';
import { SummaryCards } from './components/SummaryCards';
import { TerminalsCard } from './components/TerminalsCard';
import { useLiveSettlements } from './hooks/useLiveSettlements';

/** PRD View 2: Business & merchant web portal. */
export function BusinessDashboardPage() {
  const { profile } = useProfile();
  const { data: settlements, isLoading, freshIds } = useLiveSettlements();
  const { data: staff } = useStaff();
  const [addStaffOpen, setAddStaffOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={profile?.name}
        action={
          <div className="flex items-center gap-2">
            <PosStatusPill className="lg:hidden" />
            <Button variant="secondary" onClick={() => setAddStaffOpen(true)}>
              <UserPlus className="size-4" /> Add cashier
            </Button>
          </div>
        }
      />
      <div className="grid gap-4">
        <SummaryCards />
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="min-w-0">
            <CardHeader
              title={
                <span className="flex items-center gap-3">
                  Incoming payments <LiveBadge />
                </span>
              }
              action={
                <Link to={paths.payments} className="text-[13px] font-medium text-primary-text">
                  View all
                </Link>
              }
            />
            <SettlementTable
              settlements={settlements?.slice(0, 8)}
              freshIds={freshIds}
              isLoading={isLoading}
            />
          </Card>
          <div className="grid gap-4">
            <TerminalsCard />
            <Card>
              <CardHeader
                title="Staff access"
                action={
                  <Link to={paths.staff} className="text-[13px] font-medium text-primary-text">
                    Manage
                  </Link>
                }
              />
              <p className="text-[13px] text-ink-2">
                {staff?.length ?? 0} cashier{staff?.length === 1 ? '' : 's'} with read-only access
                to payment alerts.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={() => setAddStaffOpen(true)}
              >
                <UserPlus className="size-4" /> Add cashier
              </Button>
            </Card>
          </div>
        </div>
      </div>
      <AddStaffModal open={addStaffOpen} onClose={() => setAddStaffOpen(false)} />
    </>
  );
}
