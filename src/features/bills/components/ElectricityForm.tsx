import { Check, LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useDiscos, useMeterLookup } from '@/api/hooks';
import type { MeterType } from '@/api/types';
import { Button, SegmentedControl, SelectField, TextField } from '@/components/ui';
import { formatNaira, formatNumber, parseAmount } from '@/lib/format';
import type { BillDraft } from '../types';

const MIN = 1_000;

export function ElectricityForm({ onContinue }: { onContinue: (d: BillDraft) => void }) {
  const { data: discos = [] } = useDiscos();
  const [discoId, setDiscoId] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('prepaid');
  const [meterNumber, setMeterNumber] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const lookup = useMeterLookup(discoId, meterNumber, meterType);
  const amount = parseAmount(amountInput);
  const valid = Boolean(lookup.data) && amount >= MIN;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || !lookup.data) return;
    const disco = discos.find((d) => d.id === discoId);
    onContinue({
      payment: { type: 'electricity', discoId, meterNumber, meterType, amount },
      title: `${disco?.shortName ?? 'Electricity'} ${meterType}`,
      details: [
        ['Customer', lookup.data.customerName],
        ['Meter', `${meterNumber} · ${meterType === 'prepaid' ? 'Prepaid' : 'Postpaid'}`],
        ['Amount', formatNaira(amount, 2)],
      ],
    });
  };

  return (
    <form className="grid gap-4" onSubmit={submit}>
      <SelectField
        label="Electricity company"
        value={discoId}
        onChange={(e) => setDiscoId(e.target.value)}
        options={[
          { value: '', label: 'Choose your provider' },
          ...discos.map((d) => ({ value: d.id, label: d.name })),
        ]}
      />
      <SegmentedControl
        label="Meter type"
        value={meterType}
        onChange={setMeterType}
        options={[
          { value: 'prepaid', label: 'Prepaid' },
          { value: 'postpaid', label: 'Postpaid' },
        ]}
      />
      <div className="grid gap-2">
        <TextField
          label="Meter number"
          inputMode="numeric"
          maxLength={13}
          placeholder="11 to 13 digits"
          value={meterNumber}
          onChange={(e) => setMeterNumber(e.target.value.replace(/\D/g, ''))}
          inputClassName="tabular"
        />
        {lookup.isFetching && (
          <p className="flex items-center gap-2 text-[13px] text-ink-3">
            <LoaderCircle className="size-4 animate-spin" /> Checking meter…
          </p>
        )}
        {lookup.data && !lookup.isFetching && (
          <div className="flex gap-2 rounded-field bg-success-soft px-3 py-2.25 text-[13px] text-success">
            <Check className="mt-0.5 size-4 shrink-0" />
            <span>
              <b className="font-semibold tracking-wide">{lookup.data.customerName}</b>
              <span className="block text-xs">{lookup.data.address}</span>
            </span>
          </div>
        )}
        {lookup.isError && (
          <p className="text-xs text-primary-text">
            We couldn’t find that meter. Check the number and provider.
          </p>
        )}
      </div>
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
        hint={`Minimum ${formatNaira(MIN)}`}
      />
      <Button type="submit" size="lg" block disabled={!valid}>
        Continue
      </Button>
    </form>
  );
}
