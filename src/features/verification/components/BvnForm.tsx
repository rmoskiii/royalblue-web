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

export function BvnForm({
  onDone,
  lockedBvn,
  lockedNin,
}: {
  onDone: () => void;
  lockedBvn?: string | null;
  lockedNin?: string | null;
}) {
  const [identity, setIdentity] = useState<IdentityLookup | null>(null);
  const [bvnError, setBvnError] = useState<string>();
  const [ninError, setNinError] = useState<string>();
  const submit = useMutation({
    mutationFn: async (numbers: { bvn?: string; nin?: string }) => {
      setBvnError(undefined);
      setNinError(undefined);
      let next: IdentityLookup | null = null;
      if (numbers.bvn) {
        try {
          next = toLookup((await verificationService.submitBvn(numbers.bvn)) ?? {});
        } catch (error) {
          setBvnError(error instanceof Error ? error.message : 'We couldn’t confirm that BVN.');
          throw error;
        }
      }
      if (numbers.nin) {
        let ninLookup: IdentityLookup;
        try {
          ninLookup = toLookup((await verificationService.submitNin(numbers.nin)) ?? {});
        } catch (error) {
          setNinError(error instanceof Error ? error.message : 'We couldn’t confirm that NIN.');
          throw error;
        }
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
      lockedBvn={lockedBvn}
      lockedNin={lockedNin}
      onSubmit={(numbers) => {
        if (!numbers.bvn && !numbers.nin) {
          onDone();
          return;
        }
        submit.mutate(numbers);
      }}
      isPending={submit.isPending}
      bvnError={bvnError}
      ninError={ninError}
      submitLabel="Continue"
    />
  );
}
