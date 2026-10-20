import { useState } from 'react';
import { Button, TextField } from '@/components/ui';
import { submitOnEnter } from '@/features/auth/lib/submitOnEnter';

/** Same BVN and/or NIN capture used at signup and on Account limits. Both preferred; one required. */
export function IdentityNumberForm({
  onSubmit,
  isPending,
  error,
  bvnError,
  ninError,
  submitLabel = 'Continue',
  bvnHint,
  ninHint = 'Dial *346# from your NIN-linked phone if you don’t know it.',
  intro,
  requireBvn = false,
  lockedBvn,
  lockedNin,
}: {
  onSubmit: (numbers: { bvn?: string; nin?: string }) => void;
  isPending?: boolean;
  error?: string;
  bvnError?: string;
  ninError?: string;
  submitLabel?: string;
  bvnHint?: string;
  ninHint?: string;
  intro?: string;
  requireBvn?: boolean;
  lockedBvn?: string | null;
  lockedNin?: string | null;
}) {
  const bvnHelp =
    bvnHint ??
    'Don’t know your BVN? Dial *565*0# from the phone number linked to your bank account.';
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const bvnLocked = Boolean(lockedBvn);
  const ninLocked = Boolean(lockedNin);
  const hasBvn = bvnLocked || bvn.length === 11;
  const hasNin = ninLocked || nin.length === 11;
  const ready = requireBvn ? hasBvn : hasBvn || hasNin;
  const bvnFieldError = bvnError ?? (requireBvn && error && !ninError ? error : undefined);
  const ninFieldError = ninError ?? (!bvnError ? error : undefined);

  return (
    <form
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        if (!ready) return;
        onSubmit({
          ...(!bvnLocked && bvn.length === 11 ? { bvn } : {}),
          ...(!ninLocked && nin.length === 11 ? { nin } : {}),
        });
      }}
    >
      <p className="text-sm text-ink-3">
        {intro ??
          (requireBvn
            ? 'BVN is required for the person opening this business account. NIN is optional.'
            : 'Enter BVN and NIN if you have both. At least one is required — BVN is preferred.')}
      </p>
      <TextField
        label="Bank Verification Number"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={!bvnLocked}
        maxLength={11}
        placeholder="11 digits"
        value={bvnLocked ? lockedBvn ?? '' : bvn}
        disabled={bvnLocked}
        onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
        inputClassName="tabular"
        hint={bvnLocked ? 'Already on your account' : bvnHelp}
        error={bvnFieldError}
      />
      <TextField
        label="National Identity Number"
        inputMode="numeric"
        autoComplete="off"
        maxLength={11}
        placeholder="11 digits"
        value={ninLocked ? lockedNin ?? '' : nin}
        disabled={ninLocked}
        onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
        inputClassName="tabular"
        hint={ninLocked ? 'Already on your account' : ninHint}
        error={ninFieldError}
      />
      <Button type="submit" size="lg" block disabled={!ready || isPending}>
        {isPending ? 'Checking identity…' : submitLabel}
      </Button>
    </form>
  );
}
