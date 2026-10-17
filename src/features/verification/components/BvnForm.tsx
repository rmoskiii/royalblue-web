import { useMutation } from '@tanstack/react-query';
import { CircleHelp } from 'lucide-react';
import { useState } from 'react';
import { verificationService } from '@/api/services/verification';
import { Button, SelectField, TextField } from '@/components/ui';

export function BvnForm({ onDone }: { onDone: () => void }) {
  const [kind, setKind] = useState<'bvn' | 'nin'>('bvn');
  const [number, setNumber] = useState('');
  const submit = useMutation({
    mutationFn: () =>
      kind === 'nin' ? verificationService.submitNin(number) : verificationService.submitBvn(number),
    onSuccess: onDone,
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate();
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label="ID type"
          value={kind}
          onChange={(e) => {
            setKind(e.target.value as 'bvn' | 'nin');
            setNumber('');
          }}
          options={[
            { value: 'bvn', label: 'BVN' },
            { value: 'nin', label: 'NIN' },
          ]}
        />
        <TextField
          label={kind === 'nin' ? 'NIN' : 'BVN'}
          inputMode="numeric"
          autoComplete="off"
          maxLength={11}
          placeholder={`11-digit ${kind === 'nin' ? 'NIN' : 'BVN'}`}
          value={number}
          onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
          inputClassName="tabular"
          error={submit.isError ? submit.error.message : undefined}
        />
      </div>
      <p className="flex gap-2.5 rounded-xl bg-surface-2 p-3 text-[13px] text-ink-2">
        <CircleHelp className="size-4 shrink-0" />
        {kind === 'nin'
          ? 'Your NIN confirms who you are with NIMC. We only confirm your name.'
          : 'Don’t know your BVN? Dial *565*0# from the phone number linked to your bank account. We only confirm your name — this does not freeze accounts or pull salary history.'}
      </p>
      <Button
        type="submit"
        className="justify-self-start"
        disabled={number.length !== 11 || submit.isPending}
      >
        {submit.isPending ? 'Checking…' : kind === 'nin' ? 'Validate NIN' : 'Validate BVN'}
      </Button>
    </form>
  );
}
