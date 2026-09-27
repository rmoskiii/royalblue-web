import type { TransferDestination } from '@/api/types';

/** What the customer entered, carried from the details step to PIN approval. */
export interface TransferDraft {
  destination: TransferDestination;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  fee: number;
  narration?: string;
}
