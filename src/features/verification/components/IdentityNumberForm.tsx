import { useState } from 'react';
import { Button, TextField } from '@/components/ui';
import { submitOnEnter } from '@/features/auth/lib/submitOnEnter';

/** Same BVN and/or NIN capture used at signup and on Account limits. Both preferred; one required. */
export function IdentityNumberForm({
  onSubmit,
  isPending,
  error,
  submitLabel = 'Continue',
  bvnHint,
  ninHint = 'Dial *346# from your NIN-linked phone if you don’t know it.',
}: {
  onSubmit: (numbers: { bvn?: string; nin?: string }) => void;
  isPending?: boolean;
  error?: string;
  submitLabel?: string;
  bvnHint?: string;
  ninHint?: string;
}) {
  const bvnHelp =
    bvnHint ??
    'Don’t know your BVN? Dial *565*0# from the phone number linked to your bank account.';
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const ready = bvn.length === 11 || nin.length === 11;

  return (
    <form
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        onSubmit({
          ...(bvn.length === 11 ? { bvn } : {}),
          ...(nin.length === 11 ? { nin } : {}),
        });
      }}
    >
      <p className="text-sm text-ink-3">
        Enter BVN and NIN if you have both. At least one is required — BVN is preferred.
      </p>
      <TextField
        label="Bank Verification Number"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        maxLength={11}
        placeholder="11 digits"
        value={bvn}
        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
        inputClassName="tabular"
        hint={bvnHelp}
      />
      <TextField
        label="National Identity Number"
        inputMode="numeric"
        autoComplete="off"
        maxLength={11}
        placeholder="11 digits"
        value={nin}
        onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
        inputClassName="tabular"
        hint={ninHint}
        error={error}
      />
      <Button type="submit" size="lg" block disabled={!ready || isPending}>
        {isPending ? 'Checking identity…' : submitLabel}
      </Button>
    </form>
  );
}
