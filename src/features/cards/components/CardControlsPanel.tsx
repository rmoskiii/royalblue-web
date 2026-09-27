import { Snowflake } from 'lucide-react';
import { useState } from 'react';
import type { Card } from '@/api/types';
import { Button, Card as Panel, CardHeader, Money, Switch } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { useUpdateCard } from '../hooks';

const LIMIT_MIN = 10_000;
const LIMIT_MAX = 500_000;
const LIMIT_STEP = 5_000;

/** PRD View 5 card controls matrix. */
export function CardControlsPanel({ card }: { card: Card }) {
  const { freeze, controls } = useUpdateCard(card.id);
  const [limit, setLimit] = useState(card.controls.dailyLimit);
  const limitChanged = limit !== card.controls.dailyLimit;

  return (
    <Panel className="grid gap-5">
      <CardHeader title="Card controls" className="mb-0" />

      <Button
        variant={card.frozen ? 'primary' : 'secondary'}
        onClick={() => freeze.mutate(!card.frozen)}
        className="justify-self-start"
      >
        <Snowflake className="size-4" />
        {card.frozen ? 'Unfreeze card' : 'Freeze card'}
      </Button>

      <div className="grid gap-4 border-t border-line pt-4">
        <Switch
          label="Online payments"
          description="Pay on websites and in apps"
          checked={card.controls.onlinePayments}
          disabled={card.frozen}
          onChange={(onlinePayments) => controls.mutate({ onlinePayments })}
        />
        <Switch
          label="International transactions"
          description="Pay in other currencies and on foreign sites"
          checked={card.controls.international}
          disabled={card.frozen}
          onChange={(international) => controls.mutate({ international })}
        />
      </div>

      <div className="border-t border-line pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <label htmlFor="daily-limit" className="font-medium">
            Daily spending limit
          </label>
          <Money amount={limit} className="font-semibold" />
        </div>
        <input
          id="daily-limit"
          type="range"
          min={LIMIT_MIN}
          max={LIMIT_MAX}
          step={LIMIT_STEP}
          value={limit}
          disabled={card.frozen}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="my-2 w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-ink-3">
          <span>{formatNaira(LIMIT_MIN)}</span>
          <span>{formatNaira(LIMIT_MAX)}</span>
        </div>
        {limitChanged && (
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => controls.mutate({ dailyLimit: limit })}>
              Save limit
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setLimit(card.controls.dailyLimit)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </Panel>
  );
}
