import { useState, type FormEvent } from 'react';
import { networks } from '@/api/reference';
import type { Network } from '@/api/types';
import { Button, TextField } from '@/components/ui';
import { formatNaira, formatNumber, parseAmount } from '@/lib/format';
import type { BillDraft } from '../types';
import { NetworkPicker } from './NetworkPicker';
import { PhoneField } from './PhoneField';

const QUICK = [100, 200, 500, 1_000, 2_000, 5_000];
const MIN = 50;
const MAX = 50_000;

export function AirtimeForm({ onContinue }: { onContinue: (d: BillDraft) => void }) {
  const [network, setNetwork] = useState<Network>('mtn');
  const [phone, setPhone] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const amount = parseAmount(amountInput);
  const outOfRange = amount > 0 && (amount < MIN || amount > MAX);
  const valid = /^\d{10}$/.test(phone) && amount >= MIN && amount <= MAX;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const networkName = networks.find((n) => n.id === network)?.name ?? network;
    onContinue({
      payment: { type: 'airtime', network, phone: `0${phone}`, amount },
      title: `${networkName} airtime`,
      details: [
        ['Phone', `0${phone}`],
        ['Network', networkName],
        ['Amount', formatNaira(amount, 2)],
      ],
    });
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <NetworkPicker value={network} onChange={setNetwork} />
      <PhoneField value={phone} onChange={setPhone} />
      <div className="grid gap-2">
        <TextField
          label="Amount"
          prefix="₦"
          inputMode="numeric"
          placeholder="0"
          value={amountInput}
          onChange={(e) => {
            const n = parseAmount(e.target.value);
            setAmountInput(n ? formatNumber(n) : '');
          }}
          inputClassName="text-lg font-semibold tabular"
          error={
            outOfRange ? `Enter between ${formatNaira(MIN)} and ${formatNaira(MAX)}.` : undefined
          }
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmountInput(formatNumber(a))}
              className="h-7.5 rounded-full border border-line bg-surface px-3 text-[13px] font-medium hover:border-brand"
            >
              {formatNaira(a)}
            </button>
          ))}
        </div>
      </div>
      <Button type="submit" size="lg" block disabled={!valid}>
        Continue
      </Button>
    </form>
  );
}
