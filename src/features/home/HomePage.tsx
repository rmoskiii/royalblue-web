import { useState } from 'react';
import { ActiveLoanCard } from './components/ActiveLoanCard';
import { AddMoneySheet } from './components/AddMoneySheet';
import { BalanceCard } from './components/BalanceCard';
import { InsightsCard } from './components/InsightsCard';
import { ReferCard, VirtualCardPromo } from './components/PromoCards';
import { QuickServices } from './components/QuickServices';
import { RecentTransactions } from './components/RecentTransactions';
import { TierBanner } from './components/TierBanner';

/** Main column + right rail on xl screens; everything stacks below that. */
export function HomePage() {
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid min-w-0 content-start gap-4">
        <BalanceCard onAddMoney={() => setAddMoneyOpen(true)} />
        <QuickServices />
        <TierBanner />
        <ActiveLoanCard />
        <RecentTransactions />
      </div>
      <aside className="grid min-w-0 content-start gap-4">
        <InsightsCard />
        <ReferCard />
        <VirtualCardPromo />
      </aside>
      <AddMoneySheet open={addMoneyOpen} onClose={() => setAddMoneyOpen(false)} />
    </div>
  );
}
