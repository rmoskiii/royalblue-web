import { useState } from 'react';
import { QuickTransferCard } from '@/features/transfer/components/QuickTransferCard';
import { ActiveLoanCard } from './components/ActiveLoanCard';
import { AddMoneySheet } from './components/AddMoneySheet';
import { BalanceCard } from './components/BalanceCard';
import { InsightsCard } from './components/InsightsCard';
import { ReferCard, VirtualCardPromo } from './components/PromoCards';
import { QuickServices } from './components/QuickServices';
import { ReceiveSheet } from './components/ReceiveSheet';
import { RecentTransactions } from './components/RecentTransactions';
import { TierBanner } from './components/TierBanner';

/**
 * PRD View 1. Balance and actions on top; then recent transactions (left)
 * and quick transfer / beneficiaries (right) from xl. Everything stacks below xl.
 */
export function HomePage() {
  const [sheet, setSheet] = useState<'receive' | 'add-money' | null>(null);

  return (
    <div className="grid gap-4">
      <BalanceCard onReceive={() => setSheet('receive')} onAddMoney={() => setSheet('add-money')} />
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
          <div className="order-6 xl:order-none">
            <VirtualCardPromo />
          </div>
        </div>
      </div>

      <ReceiveSheet open={sheet === 'receive'} onClose={() => setSheet(null)} />
      <AddMoneySheet open={sheet === 'add-money'} onClose={() => setSheet(null)} />
    </div>
  );
}
