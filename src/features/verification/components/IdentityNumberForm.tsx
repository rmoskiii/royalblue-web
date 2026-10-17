import { useState } from 'react';
import { Button, SegmentedControl, TextField } from '@/components/ui';
import { submitOnEnter } from '@/features/auth/lib/submitOnEnter';

export type IdentityKind = 'bvn' | 'nin';

/** Same BVN/NIN capture used at signup and on Account limits. */
export function IdentityNumberForm({
  onSubmit,
  isPending,
  error,
  submitLabel = 'Continue',
  onSkip,
  skipLabel = 'Skip for now — finish later in Account limits',
  onContinueUnverified,
  continueUnverifiedLabel = 'Continue without waiting',
  bvnHint,
  ninHint = 'Dial *346# from your NIN-linked phone if you don’t know it.',
}: {
  onSubmit: (kind: IdentityKind, number: string) => void;
  isPending?: boolean;
  error?: string;
  submitLabel?: string;
  onSkip?: () => void;
  skipLabel?: string;
  onContinueUnverified?: (kind: IdentityKind, number: string) => void;
  continueUnverifiedLabel?: string;
  bvnHint?: string;
  ninHint?: string;
}) {
  const bvnHelp =
    bvnHint ??
    (onContinueUnverified
      ? 'We’ll confirm this now. Use continue without waiting only if the lookup is slow — the number still saves.'
      : 'Don’t know your BVN? Dial *565*0# from the phone number linked to your bank account.');
  const [kind, setKind] = useState<IdentityKind>('bvn');
  const [number, setNumber] = useState('');

  return (
    <form
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        if (number.length === 11) onSubmit(kind, number);
      }}
    >
      <SegmentedControl
        label="Identity number type"
        value={kind}
        onChange={(next) => {
          setKind(next);
          setNumber('');
        }}
        options={[
          { value: 'bvn', label: 'BVN' },
          { value: 'nin', label: 'NIN' },
        ]}
      />
      <TextField
        label={kind === 'bvn' ? 'Bank Verification Number' : 'National Identity Number'}
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        maxLength={11}
        placeholder="11 digits"
        value={number}
        onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
        inputClassName="tabular"
        hint={kind === 'bvn' ? bvnHelp : ninHint}
        error={error}
      />
      <Button type="submit" size="lg" block disabled={number.length !== 11 || isPending}>
        {isPending ? 'Checking identity…' : submitLabel}
      </Button>
      {onContinueUnverified && (
        <button
          type="button"
          className="text-sm font-medium text-brand"
          disabled={number.length !== 11 || isPending}
          onClick={() => onContinueUnverified(kind, number)}
        >
          {continueUnverifiedLabel}
        </button>
      )}
      {onSkip && (
        <button type="button" className="text-sm font-medium text-ink-2" onClick={onSkip}>
          {skipLabel}
        </button>
      )}
    </form>
  );
}
