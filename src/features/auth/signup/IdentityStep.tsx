import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { authService } from '@/api/services/auth';
import type { IdentityLookup, IdentityType } from '@/api/types';
import { Button, SegmentedControl, TextField } from '@/components/ui';
import { demo } from '@/config/demo';

export function IdentityStep({
  signUpToken,
  onDone,
}: {
  signUpToken: string;
  onDone: (identity: IdentityLookup) => void;
}) {
  const [type, setType] = useState<IdentityType>('bvn');
  const [number, setNumber] = useState(demo?.signUp.bvn ?? '');
  const submit = useMutation({
    mutationFn: () => authService.lookupIdentity(signUpToken, type, number),
    onSuccess: onDone,
  });

  return (
    <form
      className="grid gap-4"
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
        maxLength={11}
        placeholder="11 digits"
        value={number}
        onChange={(e) => setNumber(e.target.value.replace(/\D/g, ''))}
        inputClassName="tabular"
        hint={
          type === 'bvn'
            ? 'Dial *565*0# from your bank-linked phone if you don’t know it.'
            : 'Dial *346# from your NIN-linked phone if you don’t know it.'
        }
        error={submit.isError ? submit.error.message : undefined}
      />
      <Button type="submit" size="lg" block disabled={number.length !== 11 || submit.isPending}>
        {submit.isPending ? 'Fetching your details…' : 'Continue'}
      </Button>
    </form>
  );
}
