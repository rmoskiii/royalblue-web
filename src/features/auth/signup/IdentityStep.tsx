import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/auth';
import type { IdentityLookup } from '@/api/types';
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

export function IdentityStep({
  email,
  otp,
  firstName,
  lastName,
  phone,
  onDone,
}: {
  email: string;
  otp?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  onDone: (identity: IdentityLookup, submitted: { bvn?: string; nin?: string }) => void;
}) {
  const submit = useMutation({
    mutationFn: async (numbers: { bvn?: string; nin?: string }) => {
      let identity: IdentityLookup | null = null;
      const extras = { phone, firstName, lastName, email, otp };
      if (numbers.bvn) {
        identity = mergeIdentity(
          identity,
          await authService.lookupIdentity('bvn', numbers.bvn, extras),
        );
      }
      if (numbers.nin) {
        identity = mergeIdentity(
          identity,
          await authService.lookupIdentity('nin', numbers.nin, extras),
        );
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
      onSubmit={(numbers) => submit.mutate(numbers)}
      isPending={submit.isPending}
      error={submit.isError ? submit.error.message : undefined}
    />
  );
}
