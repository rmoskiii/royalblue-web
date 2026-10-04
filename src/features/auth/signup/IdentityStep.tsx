import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { authService } from '@/api/services/auth';
import type { IdentityLookup, IdentityType } from '@/api/types';
import { Button, SegmentedControl, TextField } from '@/components/ui';
import { demo } from '@/config/demo';
import { submitOnEnter } from '../lib/submitOnEnter';

export function IdentityStep({
  firstName,
  lastName,
  phone,
  onDone,
}: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  onDone: (identity: IdentityLookup, submitted: { type: IdentityType; number: string }) => void;
}) {
  const [type, setType] = useState<IdentityType>('bvn');
  const [number, setNumber] = useState(demo?.signUp.bvn ?? '');
  const fallback = (): IdentityLookup => ({
    firstName: firstName || 'Pending',
    lastName: lastName || 'Customer',
    dateOfBirth: '1990-01-01',
    photoUrl: null,
    pending: true,
  });
  const submit = useMutation({
    mutationFn: async () => {
      const lookup = authService.lookupIdentity(type, number, { phone, firstName, lastName });
      const timed = await Promise.race([
        lookup.then((identity) => ({ ok: true as const, identity })),
        new Promise<{ ok: false }>((resolve) => {
          window.setTimeout(() => resolve({ ok: false }), 8_000);
        }),
      ]);
      if (timed.ok) return timed.identity;
      return fallback();
    },
    onSuccess: (identity) => onDone(identity, { type, number }),
  });

  const skipIdentity = () => onDone(fallback(), { type, number: '' });
  const continuePending = () => onDone(fallback(), { type, number });

  return (
    <form
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        if (number.length === 11) submit.mutate();
      }}
    >
      <SegmentedControl
        label="Identity number type"
        value={type}
        onChange={(t) => {
          setType(t);
          setNumber('');
        }}
        options={[
          { value: 'bvn', label: 'BVN' },
          { value: 'nin', label: 'NIN' },
        ]}
      />
      <TextField
        label={type === 'bvn' ? 'Bank Verification Number' : 'National Identity Number'}
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        maxLength={11}
        placeholder="11 digits"
        value={number}
        onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
        inputClassName="tabular"
        hint={
          type === 'bvn'
            ? 'We confirm your name via BudPay KYC. This does not freeze other bank accounts or pull loan history.'
            : 'Dial *346# from your NIN-linked phone if you don’t know it.'
        }
        error={submit.isError ? submit.error.message : undefined}
      />
      <Button type="submit" size="lg" block disabled={number.length !== 11 || submit.isPending}>
        {submit.isPending ? 'Checking identity…' : 'Continue'}
      </Button>
      <button
        type="button"
        className="text-sm font-medium text-brand"
        disabled={number.length !== 11 || submit.isPending}
        onClick={continuePending}
      >
        Continue without waiting
      </button>
      <button type="button" className="text-sm font-medium text-ink-2" onClick={skipIdentity}>
        Skip for now — ₦50k starter limits
      </button>
    </form>
  );
}
