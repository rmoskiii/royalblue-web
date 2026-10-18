import { useInsights } from '@/api/hooks';
import { Card, CardHeader, Money, PageHeader } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { monthDelta, padBreakdown, spendColour } from './spendCategories';

export function InsightsPage() {
  const { data, isLoading } = useInsights();
  const rows = padBreakdown(data?.breakdown, data?.moneyOut ?? 0);
  const moneyOut = data?.moneyOut ?? 0;
  const spent = rows.filter((row) => (row.amount ?? moneyOut * row.share) > 0);

  return (
    <div className="mx-auto grid min-w-0 max-w-2xl gap-4 overflow-x-hidden">
      <PageHeader
        title="Insights"
        subtitle={
          data
            ? `${data.periodLabel}. Categories stay listed even when you have not spent in them yet.`
            : 'Spending this month, split by category'
        }
      />

      <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-3">
        <Stat label="Money in" amount={data?.moneyIn ?? 0} tone="in" />
        <Stat label="Money out" amount={moneyOut} tone="out" />
        <Stat label="Net" amount={data?.net ?? (data ? data.moneyIn - moneyOut : 0)} tone="net" />
      </div>

      {data && (
        <p className="min-w-0 text-[13px] break-words text-ink-2">
          {monthDelta(moneyOut, data.lastMonth?.moneyOut ?? 0)}
          {data.debitCount
            ? `. ${data.debitCount} outgoing payment${data.debitCount === 1 ? '' : 's'}${
                data.averageDebit ? `, typical ${formatNaira(data.averageDebit)}` : ''
              }.`
            : '.'}
        </p>
      )}

      <Card className="min-w-0 overflow-hidden">
        <CardHeader title="Spending by category" />
        {spent.length > 0 && (
          <div className="mb-4 flex h-2.5 min-w-0 overflow-hidden rounded-full" aria-hidden>
            {spent.map((b, i) => (
              <span
                key={b.id ?? b.category}
                className="min-h-full min-w-0"
                style={{
                  flexGrow: Math.max(b.share || 0, 0.02),
                  flexBasis: 0,
                  backgroundColor: spendColour(b.id, i),
                }}
              />
            ))}
          </div>
        )}
        <ul className="grid min-w-0 gap-3">
          {rows.map((row, i) => {
            const amount = row.amount ?? Math.round(moneyOut * row.share);
            const width = moneyOut ? Math.max((amount / moneyOut) * 100, amount ? 2 : 0) : 0;
            return (
              <li key={row.id ?? row.category} className="grid min-w-0 gap-1">
                <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 text-[13px]">
                  <span className="min-w-0">
                    <span className="inline-flex max-w-full items-center gap-2">
                      <i
                        className="size-2.5 shrink-0 rounded-[3px]"
                        style={{ backgroundColor: spendColour(row.id, i) }}
                      />
                      <span className="min-w-0 truncate">{row.category}</span>
                    </span>
                    {row.count ? (
                      <span className="mt-0.5 block pl-4.5 text-ink-3">
                        {row.count} {row.count === 1 ? 'payment' : 'payments'}
                      </span>
                    ) : null}
                  </span>
                  <Money amount={amount} className="max-w-full shrink-0 break-all font-medium" />
                </div>
                <div className="h-1.5 min-w-0 overflow-hidden rounded-full bg-surface-3">
                  <span
                    className="block h-full max-w-full rounded-full"
                    style={{ width: `${width}%`, backgroundColor: spendColour(row.id, i) }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        {!isLoading && moneyOut === 0 && (
          <p className="mt-3 text-[13px] break-words text-ink-2">
            No outgoing payments this month yet. When you transfer, buy airtime, pay a bill, or
            spend at a shop or restaurant, they land in these buckets.
          </p>
        )}
      </Card>

      {data?.largestOut && (
        <Card className="min-w-0 overflow-hidden">
          <CardHeader title="Largest payment" />
          <p className="text-sm font-medium break-words">{data.largestOut.counterparty}</p>
          {data.largestOut.title && data.largestOut.title !== data.largestOut.counterparty && (
            <p className="text-[13px] break-words text-ink-2">{data.largestOut.title}</p>
          )}
          <Money
            amount={data.largestOut.amount}
            className="mt-1 max-w-full break-all text-lg font-semibold"
          />
        </Card>
      )}

      {(data?.topPayees?.length ?? 0) > 0 && (
        <Card className="min-w-0 overflow-hidden">
          <CardHeader title="People and merchants you paid" />
          <ul className="grid min-w-0 gap-2 text-[13px]">
            {data!.topPayees!.map((row) => (
              <li
                key={row.name}
                className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3"
              >
                <span className="min-w-0">
                  <span className="block truncate">{row.name}</span>
                  <span className="text-ink-3">
                    {row.count} {row.count === 1 ? 'time' : 'times'}
                  </span>
                </span>
                <Money amount={row.amount} className="max-w-full shrink-0 break-all font-medium" />
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Stat({
  label,
  amount,
  tone,
}: {
  label: string;
  amount: number;
  tone: 'in' | 'out' | 'net';
}) {
  return (
    <Card className="min-w-0 overflow-hidden px-4 py-3.5">
      <p className="text-xs text-ink-3">{label}</p>
      <Money
        amount={amount}
        signed={tone === 'net'}
        className={
          tone === 'in'
            ? 'max-w-full break-all text-[22px] font-semibold text-success'
            : tone === 'out'
              ? 'max-w-full break-all text-[22px] font-semibold text-primary-text'
              : 'max-w-full break-all text-[22px] font-semibold'
        }
      />
    </Card>
  );
}
