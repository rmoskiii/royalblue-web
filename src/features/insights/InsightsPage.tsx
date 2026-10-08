import { useState } from 'react';
import { useTransactions } from '@/api/hooks';
import type { Transaction } from '@/api/types';
import { PageHeader } from '@/components/ui';
import { InsightsCard } from '@/features/home/components/InsightsCard';
import { ReceiptSheet } from '@/features/transactions/components/ReceiptSheet';
import { TransactionList } from '@/features/transactions/components/TransactionList';

export function InsightsPage() {
  const { data: transactions = [], isLoading } = useTransactions({});
  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <div className="mx-auto grid min-w-0 max-w-2xl gap-4">
      <PageHeader title="Insights" subtitle="This month on your ledger" />
      <InsightsCard />
      <div className="min-w-0">
        <h2 className="mb-2 text-sm font-semibold">Recent activity</h2>
        <TransactionList
          transactions={transactions.slice(0, 8)}
          isLoading={isLoading}
          onSelect={setSelected}
        />
      </div>
      <ReceiptSheet transaction={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
