import type { AccountType, IdDocumentType } from '@/api/types';

/** Everything the user enters across the verification steps. */
export interface VerificationForm {
  accountType: AccountType;
  bvn: string;
  idType: IdDocumentType;
  idNumber: string;
  proofOfAddress: File | null;
  phone: string;
}

export interface StepProps {
  form: VerificationForm;
  update: (patch: Partial<VerificationForm>) => void;
}
