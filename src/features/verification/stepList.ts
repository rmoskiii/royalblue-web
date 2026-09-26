import type { VerificationStepId } from '@/api/types';

export const verificationSteps: { id: VerificationStepId; label: string }[] = [
  { id: 'account-type', label: 'Account type' },
  { id: 'bvn', label: 'BVN' },
  { id: 'id-document', label: 'ID document' },
  { id: 'proof-of-address', label: 'Proof of address' },
  { id: 'phone', label: 'Phone number' },
];
