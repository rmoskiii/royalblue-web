import { Link } from 'react-router';
import { useInsights } from '@/api/hooks';
import { paths } from '@/components/layout/navigation';
import { Card, CardHeader, Money, Skeleton } from '@/components/ui';
import { padBreakdown, spendColour } from '@/features/insights/spendCategories';

export function InsightsCard() {
  const { data, isLoading } = useInsights();
  const rows = padBreakdown(data?.breakdown, data?.moneyOut ?? 0);
  const spent = rows.filter((row) => (row.amount ?? 0) > 0);

  return (
    <Card>
      <CardHeader
        title="Insights"
        action={
          <Link to={paths.insights} className="text-xs font-medium text-brand hover:underline">
            {data?.periodLabel ?? 'See all'}
          </Link>
        }
      />
      {isLoading && !data && (
        <div className="mt-3 grid gap-3" aria-busy="true" aria-label="Loading insights">
          <Skeleton className="h-10" />
          <Skeleton className="h-2.5" />
          <Skeleton className="h-16" />
        </div>
      )}
      {data && (
        <>
          <div className="my-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-ink-3">Money in</p>
              <Money amount={data.moneyIn} className="text-[22px] font-semibold text-success" />
            </div>
            <div>
              <p className="text-xs text-ink-3">Money out</p>
              <Money
                amount={data.moneyOut}
                className="text-[22px] font-semibold text-primary-text"
              />
            </div>
          </div>

          {spent.length > 0 ? (
            <>
              <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
                {spent.map((b, i) => (
                  <span
                    key={b.id ?? b.category}
                    title={`${b.category}: ${Math.round(b.share * 100)}%`}
                    style={{
                      width: `${Math.max(b.share * 100, 2)}%`,
                      backgroundColor: spendColour(b.id, i),
                    }}
                  />
                ))}
              </div>
              <ul className="mt-3 grid gap-1.75 text-[13px]">
                {spent.map((b, i) => (
                  <li
                    key={b.id ?? b.category}
                    className="grid grid-cols-[10px_1fr_auto] items-center gap-2"
                  >
                    <i
                      className="size-2.5 rounded-[3px]"
                      style={{ backgroundColor: spendColour(b.id, i) }}
                    />
                    <span>{b.category}</span>
                    <Money amount={b.amount ?? 0} className="font-medium" />
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-[13px] text-ink-2">
              Shopping, food, bills, airtime and transfers show up here as you spend.
            </p>
          )}
        </>
      )}
    </Card>
  );
}
