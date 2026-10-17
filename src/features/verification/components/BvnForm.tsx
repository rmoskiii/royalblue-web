import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { verificationService } from '@/api/services/verification';
import type { IdentityLookup } from '@/api/types';
import { ConfirmStep } from '@/features/auth/signup/ConfirmStep';
import { IdentityNumberForm, type IdentityKind } from './IdentityNumberForm';

function toLookup(result: {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
  pending?: boolean;
}): IdentityLookup {
  const pending = result.pending !== false;
  return {
    firstName: result.firstName ?? '',
    lastName: result.lastName ?? '',
    dateOfBirth: result.dateOfBirth ?? null,
    photoUrl: result.photoUrl ?? null,
    pending,
    verified: Boolean(result.firstName) && !pending,
  };
}

export function BvnForm({ onDone }: { onDone: () => void }) {
  const [identity, setIdentity] = useState<IdentityLookup | null>(null);
  const submit = useMutation({
    mutationFn: ({ kind, number }: { kind: IdentityKind; number: string }) =>
      kind === 'nin'
        ? verificationService.submitNin(number)
        : verificationService.submitBvn(number),
    onSuccess: (result) => setIdentity(toLookup(result ?? {})),
  });

  if (identity) {
    return (
      <ConfirmStep
        identity={identity}
        unverifiedHint="This number is saved. You can retry the lookup any time, then continue with ID and address."
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
      onSubmit={(kind, number) => submit.mutate({ kind, number })}
      isPending={submit.isPending}
      error={submit.isError ? submit.error.message : undefined}
      submitLabel="Continue"
    />
  );
}
