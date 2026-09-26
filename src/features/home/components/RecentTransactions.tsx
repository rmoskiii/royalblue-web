import { useState } from 'react';
import { Link } from 'react-router';
import { useTransactions } from '@/api/hooks';
import type { Transaction } from '@/api/types';
import { paths } from '@/components/layout/navigation';
import { Card, CardHeader } from '@/components/ui';
import { ReceiptSheet } from '@/features/transactions/components/ReceiptSheet';
import { TransactionList } from '@/features/transactions/components/TransactionList';

export function RecentTransactions() {
  const { data, isLoading } = useTransactions();
  const [selected, setSelected] = useState<Transaction | null>(null);

  return (
    <Card>
      <CardHeader
        title="Recent transactions"
        action={
          <Link to={paths.transactions} className="text-[13px] font-medium text-primary-text">
            See all
          </Link>
        }
      />
      <TransactionList
        transactions={data?.slice(0, 6)}
        isLoading={isLoading}
        onSelect={setSelected}
      />
      <ReceiptSheet transaction={selected} onClose={() => setSelected(null)} />
    </Card>
  );
}
