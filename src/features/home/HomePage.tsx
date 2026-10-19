import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/hooks';
import { accountService } from '@/api/services/accounts';
import { useToast } from '@/app/providers/ToastProvider';
import { QuickTransferCard } from '@/features/transfer/components/QuickTransferCard';
import { ActiveLoanCard } from './components/ActiveLoanCard';
import { BalanceCard } from './components/BalanceCard';
import { InsightsCard } from './components/InsightsCard';
import { PaymentLinkSheet } from './components/PaymentLinkSheet';
import { ReferCard } from './components/PromoCards';
import { QuickServices } from './components/QuickServices';
import { RecentTransactions } from './components/RecentTransactions';
import { TierBanner } from './components/TierBanner';

/**
 * PRD View 1. Balance and actions on top; then recent transactions (left)
 * and quick transfer / beneficiaries (right) from xl. Everything stacks below xl.
 */
export function HomePage() {
  const [sheet, setSheet] = useState<'payment-link' | null>(null);
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const verifying = useRef(false);

  useEffect(() => {
    const reference = params.get('reference');
    const status = params.get('status');
    if (!reference || verifying.current) return;
    verifying.current = true;
    if (status && status !== 'success') {
      showToast(
        status === 'cancelled' ? 'Card payment was cancelled.' : 'Card payment did not complete.',
      );
      setParams({}, { replace: true });
      return;
    }
    void accountService
      .verifyCardTopup(reference)
      .then((result) => {
        queryClient.invalidateQueries({ queryKey: queryKeys.account });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
        queryClient.invalidateQueries({ queryKey: queryKeys.insights });
        showToast(`₦${result.amount.toLocaleString('en-NG')} card top-up received`);
      })
      .catch((error: Error) => showToast(error.message))
      .finally(() => setParams({}, { replace: true }));
  }, [params, queryClient, setParams, showToast]);

  return (
    <div className="grid gap-4">
      <BalanceCard onPaymentLink={() => setSheet('payment-link')} />
      <QuickServices />
      <TierBanner />

      {/* Phones: one column in `order`. xl: transactions left, quick transfer column right. */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div className="contents xl:grid xl:min-w-0 xl:gap-4">
          <div className="order-2 min-w-0 xl:order-none">
            <RecentTransactions />
          </div>
        </div>
        <div className="contents xl:grid xl:min-w-0 xl:gap-4">
          <div className="order-1 xl:order-none">
            <QuickTransferCard />
          </div>
          <div className="order-3 xl:order-none">
            <ActiveLoanCard />
          </div>
          <div className="order-4 xl:order-none">
            <InsightsCard />
          </div>
          <div className="order-5 xl:order-none">
            <ReferCard />
          </div>
          {/* <div className="order-6 xl:order-none">
            <VirtualCardPromo />
          </div> */}
        </div>
      </div>

      <PaymentLinkSheet open={sheet === 'payment-link'} onClose={() => setSheet(null)} />
    </div>
  );
}
