import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { verificationService } from '@/api/services/verification';
import type { IdentityLookup } from '@/api/types';
import { ConfirmStep } from '@/features/auth/signup/ConfirmStep';
import { IdentityNumberForm } from './IdentityNumberForm';

function toLookup(result: {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
  residentialAddress?: string | null;
  pending?: boolean;
}): IdentityLookup {
  const pending = result.pending !== false;
  return {
    firstName: result.firstName ?? '',
    lastName: result.lastName ?? '',
    dateOfBirth: result.dateOfBirth ?? null,
    photoUrl: result.photoUrl ?? null,
    residentialAddress: result.residentialAddress ?? null,
    pending,
    verified: Boolean(result.firstName) && !pending,
  };
}

export function BvnForm({ onDone }: { onDone: () => void }) {
  const [identity, setIdentity] = useState<IdentityLookup | null>(null);
  const submit = useMutation({
    mutationFn: async (numbers: { bvn?: string; nin?: string }) => {
      let next: IdentityLookup | null = null;
      if (numbers.bvn) {
        next = toLookup((await verificationService.submitBvn(numbers.bvn)) ?? {});
      }
      if (numbers.nin) {
        const ninLookup = toLookup((await verificationService.submitNin(numbers.nin)) ?? {});
        next = next
          ? {
              ...next,
              ...ninLookup,
              firstName: ninLookup.firstName || next.firstName,
              lastName: ninLookup.lastName || next.lastName,
              residentialAddress: ninLookup.residentialAddress || next.residentialAddress,
              verified: Boolean(ninLookup.verified || next.verified),
              pending: Boolean(ninLookup.pending && next.pending),
            }
          : ninLookup;
      }
      return next;
    },
    onSuccess: (result) => setIdentity(result),
  });

  if (identity) {
    return (
      <ConfirmStep
        identity={identity}
        onConfirm={onDone}
        onReject={() => {
          setIdentity(null);
          submit.reset();
        }}
      />
    );
  }

  return (
    <IdentityNumberForm
      onSubmit={(numbers) => submit.mutate(numbers)}
      isPending={submit.isPending}
      error={submit.isError ? submit.error.message : undefined}
      submitLabel="Continue"
    />
  );
}
