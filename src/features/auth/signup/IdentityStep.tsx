import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { authService } from '@/api/services/auth';
import type { AccountKind, IdentityLookup } from '@/api/types';
import { IdentityNumberForm } from '@/features/verification/components/IdentityNumberForm';

function mergeIdentity(base: IdentityLookup | null, next: IdentityLookup): IdentityLookup {
  if (!base) return next;
  return {
    ...base,
    ...next,
    firstName: next.firstName || base.firstName,
    lastName: next.lastName || base.lastName,
    dateOfBirth: next.dateOfBirth || base.dateOfBirth,
    photoUrl: next.photoUrl || base.photoUrl,
    residentialAddress: next.residentialAddress || base.residentialAddress,
    city: next.city || base.city,
    state: next.state || base.state,
    verified: Boolean(next.verified || base.verified),
    pending: Boolean(next.pending && base.pending),
  };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'We couldn’t confirm that identity number.';
}

export function IdentityStep({
  email,
  otp,
  firstName,
  lastName,
  phone,
  accountKind,
  onDone,
}: {
  email: string;
  otp?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  accountKind?: AccountKind;
  onDone: (identity: IdentityLookup, submitted: { bvn?: string; nin?: string }) => void;
}) {
  const requireBvn = accountKind === 'business';
  const [bvnError, setBvnError] = useState<string>();
  const [ninError, setNinError] = useState<string>();
  const submit = useMutation({
    mutationFn: async (numbers: { bvn?: string; nin?: string }) => {
      setBvnError(undefined);
      setNinError(undefined);
      if (requireBvn && !numbers.bvn) {
        setBvnError('BVN is required for the person opening this business account.');
        throw new Error('BVN is required for the person opening this business account.');
      }
      let identity: IdentityLookup | null = null;
      const extras = { phone, firstName, lastName, email, otp, accountKind };
      if (numbers.bvn) {
        try {
          identity = mergeIdentity(
            identity,
            await authService.lookupIdentity('bvn', numbers.bvn, extras),
          );
        } catch (error) {
          setBvnError(errorMessage(error));
          throw error;
        }
      }
      if (numbers.nin) {
        try {
          identity = mergeIdentity(
            identity,
            await authService.lookupIdentity('nin', numbers.nin, extras),
          );
        } catch (error) {
          setNinError(errorMessage(error));
          throw error;
        }
      }
      if (!identity?.verified) {
        throw new Error('We couldn’t confirm that identity number. Check the digits and try again.');
      }
      return { identity, submitted: numbers };
    },
    onSuccess: ({ identity, submitted }) => onDone(identity, submitted),
  });

  return (
    <IdentityNumberForm
      requireBvn={requireBvn}
      onSubmit={(numbers) => submit.mutate(numbers)}
      isPending={submit.isPending}
      bvnError={bvnError}
      ninError={ninError}
    />
  );
}
