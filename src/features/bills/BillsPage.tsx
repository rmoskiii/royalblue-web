import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTransactions } from '@/api/hooks';
import type { Transaction } from '@/api/types';
import { Card, CardHeader, PageHeader, SegmentedControl } from '@/components/ui';
import { ReceiptSheet } from '@/features/transactions/components/ReceiptSheet';
import { TransactionList } from '@/features/transactions/components/TransactionList';
import { AirtimeForm } from './components/AirtimeForm';
import { BillApproveModal } from './components/BillApproveModal';
import { DataForm } from './components/DataForm';
import { ElectricityForm } from './components/ElectricityForm';
import type { BillDraft } from './types';

type BillType = 'airtime' | 'data' | 'electricity';
const billTypes: BillType[] = ['airtime', 'data', 'electricity'];

/** PRD FR-07: airtime, data and electricity with instant fulfilment. */
export function BillsPage() {
  const [params, setParams] = useSearchParams();
  const requested = params.get('type') as BillType | null;
  const type: BillType = requested && billTypes.includes(requested) ? requested : 'airtime';
  const [draft, setDraft] = useState<BillDraft | null>(null);
  const [receipt, setReceipt] = useState<Transaction | null>(null);

  const { data: transactions, isLoading } = useTransactions();
  const recent = transactions
    ?.filter((t) => t.category === 'bills' || t.category === 'airtime')
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Pay bills"
        subtitle="Airtime, data and electricity, delivered instantly."
      />
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <SegmentedControl
            label="Bill type"
            value={type}
            onChange={(t) => setParams({ type: t }, { replace: true })}
            options={[
              { value: 'airtime', label: 'Airtime' },
              { value: 'data', label: 'Data' },
              { value: 'electricity', label: 'Electricity' },
            ]}
            className="mb-4.5"
          />
          {/* key resets the form when switching type */}
          {type === 'airtime' && <AirtimeForm key="airtime" onContinue={setDraft} />}
          {type === 'data' && <DataForm key="data" onContinue={setDraft} />}
          {type === 'electricity' && <ElectricityForm key="electricity" onContinue={setDraft} />}
        </Card>
        <Card>
          <CardHeader title="Recent bill payments" />
          <TransactionList transactions={recent} isLoading={isLoading} onSelect={setReceipt} />
        </Card>
      </div>
      {draft && <BillApproveModal draft={draft} onClose={() => setDraft(null)} />}
      <ReceiptSheet transaction={receipt} onClose={() => setReceipt(null)} />
    </>
  );
}
