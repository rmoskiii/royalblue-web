import { useState, type FormEvent } from 'react';
import { useDataPlans } from '@/api/hooks';
import { networks } from '@/api/reference';
import type { Network } from '@/api/types';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatNaira } from '@/lib/format';
import type { BillDraft } from '../types';
import { NetworkPicker } from './NetworkPicker';
import { PhoneField } from './PhoneField';

export function DataForm({ onContinue }: { onContinue: (d: BillDraft) => void }) {
  const [network, setNetwork] = useState<Network>('mtn');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);
  const { data: plans, isLoading } = useDataPlans(network);
  const plan = plans?.find((p) => p.id === planId);
  const valid = /^\d{10}$/.test(phone) && Boolean(plan);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || !plan) return;
    const networkName = networks.find((n) => n.id === network)?.name ?? network;
    onContinue({
      payment: { type: 'data', network, phone: `0${phone}`, planId: plan.id, amount: plan.price },
      title: `${networkName} data`,
      details: [
        ['Phone', `0${phone}`],
        ['Bundle', `${plan.name} · ${plan.validity}`],
        ['Amount', formatNaira(plan.price, 2)],
      ],
    });
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <NetworkPicker
        value={network}
        onChange={(n) => {
          setNetwork(n);
          setPlanId(null);
        }}
      />
      <PhoneField value={phone} onChange={setPhone} />
      <div className="grid gap-1.5">
        <span className="text-[13px] font-medium text-ink-2">Bundle</span>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-tile bg-surface-2" />
        ) : (
          <div
            role="radiogroup"
            aria-label="Data bundle"
            className="grid grid-cols-2 gap-2 sm:grid-cols-3"
          >
            {plans?.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={planId === p.id}
                onClick={() => setPlanId(p.id)}
                className={cn(
                  'grid gap-0.5 rounded-tile border border-line bg-surface px-3 py-2.5 text-left',
                  'aria-checked:border-primary aria-checked:bg-primary-soft',
                )}
              >
                <span className="font-semibold">{p.name}</span>
                <span className="text-xs text-ink-3">{p.validity}</span>
                <span className="mt-1 text-sm font-medium tabular">{formatNaira(p.price)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <Button type="submit" size="lg" block disabled={!valid}>
        Continue
      </Button>
    </form>
  );
}
