import { useInsights } from '@/api/hooks';
import { Card, CardHeader, Money } from '@/components/ui';

/** Fixed order and colours so categories look the same everywhere. */
const categoryColours = ['var(--rb-brand)', '#5856D6', '#FF6B35', '#C93C38', '#FF9500'];

export function InsightsCard() {
  const { data } = useInsights();

  return (
    <Card>
      <CardHeader
        title="Insights"
        action={<span className="text-xs text-ink-3">{data?.periodLabel}</span>}
      />
      {data && (
        <>
          <div className="my-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-ink-3">Money in</p>
              <Money amount={data.moneyIn} className="font-display text-[22px] text-success" />
            </div>
            <div>
              <p className="text-xs text-ink-3">Money out</p>
              <Money
                amount={data.moneyOut}
                className="font-display text-[22px] text-primary-text"
              />
            </div>
          </div>

          <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
            {data.breakdown.map((b, i) => (
              <span
                key={b.category}
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
