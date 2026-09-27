import type { VerificationStepId } from '@/api/types';

/** PRD View 6 progress stepper */
export const verificationSteps: { id: VerificationStepId; label: string }[] = [
  { id: 'bvn', label: 'BVN validation' },
  { id: 'id-document', label: 'ID upload' },
  { id: 'proof-of-address', label: 'Proof of address' },
];
