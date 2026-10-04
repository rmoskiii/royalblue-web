import { useMutation } from '@tanstack/react-query';
import { CircleHelp } from 'lucide-react';
import { useState } from 'react';
import { verificationService } from '@/api/services/verification';
import { Button, TextField } from '@/components/ui';

export function BvnForm({ onDone }: { onDone: () => void }) {
  const [bvn, setBvn] = useState('');
  const submit = useMutation({
    mutationFn: () => verificationService.submitBvn(bvn),
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
      <TextField
        label="BVN"
        inputMode="numeric"
        autoComplete="off"
        maxLength={11}
        placeholder="11-digit BVN"
        value={bvn}
        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
        inputClassName="tabular"
        error={submit.isError ? submit.error.message : undefined}
      />
      <p className="flex gap-2.5 rounded-xl bg-surface-2 p-3 text-[13px] text-ink-2">
        <CircleHelp className="size-4 shrink-0" />
        Don’t know your BVN? Dial *565*0# from the phone number linked to your bank account. We only
        confirm your name — this does not freeze accounts or pull salary history.
      </p>
      <Button
        type="submit"
        className="justify-self-start"
        disabled={bvn.length !== 11 || submit.isPending}
      >
        {submit.isPending ? 'Checking…' : 'Validate BVN'}
      </Button>
      <button type="button" className="justify-self-start text-sm font-medium text-ink-2" onClick={onDone}>
        Continue without waiting
      </button>
    </form>
  );
}
