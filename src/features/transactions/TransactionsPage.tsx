import { Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useInsights, useTransactions } from '@/api/hooks';
import type { Transaction, TransactionFilters } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, Money, PageHeader } from '@/components/ui';
import { ReceiptSheet } from './components/ReceiptSheet';
import { TransactionList } from './components/TransactionList';

type Filter = 'all' | 'in' | 'out' | 'pending';

const filterOptions: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'in', label: 'Money in' },
  { value: 'out', label: 'Money out' },
  { value: 'pending', label: 'Pending' },
];

function toApiFilters(filter: Filter, search: string): TransactionFilters {
  return {
    search: search || undefined,
    direction: filter === 'in' ? 'credit' : filter === 'out' ? 'debit' : undefined,
    status: filter === 'pending' ? 'pending' : undefined,
  };
}

export function TransactionsPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const { showToast } = useToast();

  const { data, isLoading } = useTransactions(toApiFilters(filter, deferredSearch));
  const { data: insights } = useInsights();

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle={insights?.periodLabel}
        action={
          <Button variant="secondary" onClick={() => showToast('Statements are coming soon')}>
            Get statement
          </Button>
        }
      />

      {insights && (
        <div className="mb-3 grid grid-cols-2 gap-3">
          <Card className="px-4 py-3.5">
            <p className="text-xs text-ink-3">Money in</p>
            <Money amount={insights.moneyIn} className="text-[22px] font-semibold text-success" />
          </Card>
          <Card className="px-4 py-3.5">
            <p className="text-xs text-ink-3">Money out</p>
            <Money
              amount={insights.moneyOut}
              className="text-[22px] font-semibold text-primary-text"
            />
          </Card>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-2.5">
        <label className="flex h-10.5 min-w-0 flex-[1_1_220px] items-center gap-2 rounded-field border border-line bg-surface px-3 text-ink-3">
          <Search className="size-4 shrink-0" />
          <span className="sr-only">Search transactions</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, bank or amount"
            className="w-full bg-transparent text-ink outline-none placeholder:text-ink-3"
          />
        </label>
        <div
          role="group"
          aria-label="Filter"
          className="scrollbar-none flex max-w-full gap-1.5 overflow-x-auto"
        >
          {filterOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              aria-pressed={filter === o.value}
              onClick={() => setFilter(o.value)}
              className="h-8.5 shrink-0 rounded-full border border-line bg-surface px-3.5 text-[13px] font-medium text-ink-2 aria-pressed:border-pill-on aria-pressed:bg-pill-on aria-pressed:text-pill-on-ink"
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="px-2.5 py-2">
        <TransactionList transactions={data} isLoading={isLoading} onSelect={setSelected} />
      </Card>
      <ReceiptSheet transaction={selected} onClose={() => setSelected(null)} />
    </>
  );
}
