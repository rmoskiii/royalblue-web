import { useState } from 'react';
import { Link } from 'react-router';
import { useProfile } from '@/app/providers/ProfileProvider';
import { paths } from '@/components/layout/navigation';
import { Card, CardHeader, PageHeader } from '@/components/ui';
import { BalanceCard } from '@/features/home/components/BalanceCard';
import { PaymentLinkSheet } from '@/features/home/components/PaymentLinkSheet';
import { QuickServices } from '@/features/home/components/QuickServices';
import { TierBanner } from '@/features/home/components/TierBanner';
import { QuickTransferCard } from '@/features/transfer/components/QuickTransferCard';
import { LiveBadge } from './components/LiveBadge';
import { SettlementTable } from './components/SettlementTable';
import { SummaryCards } from './components/SummaryCards';
import { useLiveSettlements } from './hooks/useLiveSettlements';

/** Same wallet as personal: receive to the dedicated account, send out, see inbound credits. */
export function BusinessDashboardPage() {
  const { profile } = useProfile();
  const { data: settlements, isLoading, freshIds } = useLiveSettlements();
  const [sheet, setSheet] = useState<'payment-link' | null>(null);

  return (
    <>
      <PageHeader title="Dashboard" subtitle={profile?.name} />
      <div className="grid gap-4">
        <BalanceCard onPaymentLink={() => setSheet('payment-link')} />
        <QuickServices />
        <TierBanner />
        <SummaryCards />
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Card className="min-w-0">
            <CardHeader
              title={
                <span className="flex items-center gap-3">
                  Money in <LiveBadge />
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
          <QuickTransferCard />
        </div>
      </div>
      <PaymentLinkSheet open={sheet === 'payment-link'} onClose={() => setSheet(null)} />
    </>
  );
}
