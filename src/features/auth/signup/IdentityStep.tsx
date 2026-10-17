import { useMutation } from '@tanstack/react-query';
import { authService } from '@/api/services/auth';
import type { IdentityLookup, IdentityType } from '@/api/types';
import { IdentityNumberForm } from '@/features/verification/components/IdentityNumberForm';

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
  const unverified = (): IdentityLookup => ({
    firstName: firstName || '',
    lastName: lastName || '',
    dateOfBirth: null,
    photoUrl: null,
    pending: true,
    verified: false,
  });
  const submit = useMutation({
    mutationFn: ({ type, number }: { type: IdentityType; number: string }) =>
      authService.lookupIdentity(type, number, { phone, firstName, lastName }),
    onSuccess: (identity, vars) => onDone(identity, vars),
  });

  return (
    <IdentityNumberForm
      onSubmit={(type, number) => submit.mutate({ type, number })}
      isPending={submit.isPending}
      error={submit.isError ? submit.error.message : undefined}
      onContinueUnverified={(type, number) => onDone(unverified(), { type, number })}
      onSkip={() => onDone(unverified(), { type: 'bvn', number: '' })}
      skipLabel="Skip for now — ₦50k starter limits"
    />
  );
}
