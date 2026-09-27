import type { BillPayment } from '@/api/types';

/** A bill ready for PIN approval, with the lines to show on the confirm screen. */
export interface BillDraft {
  payment: BillPayment;
  title: string;
  details: [label: string, value: string][];
}
