import { Link } from 'react-router';
import { useInsights } from '@/api/hooks';
import { paths } from '@/components/layout/navigation';
import { Card, CardHeader, Money } from '@/components/ui';

/** Chart slots in fixed order (see --rb-series-* in styles/index.css). */
const categoryColours = [1, 2, 3, 4, 5].map((n) => `var(--rb-series-${n})`);

export function InsightsCard() {
  const { data } = useInsights();

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

          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
            {data.breakdown.map((b, i) => (
              <span
                key={b.category}
                title={`${b.category}: ${Math.round(b.share * 100)}%`}
                style={{ width: `${b.share * 100}%`, backgroundColor: categoryColours[i] }}
              />
            ))}
          </div>
          <ul className="mt-3 grid gap-1.75 text-[13px]">
            {data.breakdown.map((b, i) => (
              <li key={b.category} className="grid grid-cols-[10px_1fr_auto] items-center gap-2">
                <i
                  className="size-2.5 rounded-[3px]"
                  style={{ backgroundColor: categoryColours[i] }}
                />
                <span>{b.category}</span>
                <Money amount={Math.round(data.moneyOut * b.share)} className="font-medium" />
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
