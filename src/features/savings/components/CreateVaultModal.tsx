import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { savingsService } from '@/api/services/savings';
import type { ContributionFrequency, VaultType } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Modal, SegmentedControl, SelectField, TextField } from '@/components/ui';
import { formatNumber, parseAmount } from '@/lib/format';

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** New target or fixed (locked) vault with optional automatic saving (PRD FR-05). */
export function CreateVaultModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [type, setType] = useState<VaultType>('target');
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [lockedUntil, setLockedUntil] = useState('');
  const [autoAmount, setAutoAmount] = useState('');
  const [frequency, setFrequency] = useState<ContributionFrequency>('weekly');

  const create = useMutation({
    mutationFn: () =>
      savingsService.createVault({
        name: name.trim(),
        type,
        target: type === 'target' ? parseAmount(target) : null,
        lockedUntil: type === 'fixed' ? new Date(lockedUntil).toISOString() : null,
        autoSave: parseAmount(autoAmount) ? { amount: parseAmount(autoAmount), frequency } : null,
      }),
    onSuccess: (vault) => {
      queryClient.invalidateQueries({ queryKey: ['savings'] });
      showToast(`${vault.name} vault created`);
      onClose();
    },
  });

  const valid =
    name.trim().length > 1 && (type === 'target' ? parseAmount(target) > 0 : Boolean(lockedUntil));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) create.mutate();
  };

  const money = (setter: (v: string) => void) => (e: ChangeEvent<HTMLInputElement>) => {
    const n = parseAmount(e.target.value);
    setter(n ? formatNumber(n) : '');
  };

  return (
    <Modal open={open} onClose={onClose} title="New savings vault">
      <form className="grid gap-4 px-4 pt-2 pb-4" onSubmit={submit}>
        <SegmentedControl
          label="Vault type"
          value={type}
          onChange={setType}
          options={[
            { value: 'target', label: 'Target' },
            { value: 'fixed', label: 'Fixed (locked)' },
          ]}
        />
        <p className="-mt-1 text-xs text-ink-3">
          {type === 'target'
            ? 'Save towards a goal. Withdraw any time.'
            : 'Lock money away until a date you choose. No withdrawals before then.'}
        </p>
        <TextField
          label="Name"
          placeholder="e.g. Rent"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {type === 'target' ? (
          <TextField
            label="Goal amount"
            prefix="₦"
            inputMode="numeric"
            value={target}
            onChange={money(setTarget)}
            inputClassName="tabular"
          />
        ) : (
          <TextField
            label="Lock until"
            type="date"
            min={tomorrow()}
            value={lockedUntil}
            onChange={(e) => setLockedUntil(e.target.value)}
          />
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
          <TextField
            label={
              <>
                Save automatically <span className="text-ink-3">(optional)</span>
              </>
            }
            prefix="₦"
            inputMode="numeric"
            placeholder="0"
            value={autoAmount}
            onChange={money(setAutoAmount)}
            inputClassName="tabular"
          />
          <SelectField
            label="How often"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as ContributionFrequency)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
          />
        </div>
        {create.isError && <p className="text-[13px] text-primary-text">{create.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!valid || create.isPending}>
          {create.isPending ? 'Creating…' : 'Create vault'}
        </Button>
      </form>
    </Modal>
  );
}
