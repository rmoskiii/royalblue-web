import type { TransferDestination } from '@/api/types';

/**
 * PRD FR-03: RoyalBlue-to-RoyalBlue is always free, and other banks are free
 * while the customer has free transfers left this month. After that, the NIP
 * fee bands apply.
 * TODO(api): prefer the fee returned by the API so pricing lives server-side.
 */
export function transferFee(
  amount: number,
  destination: TransferDestination,
  freeTransfersRemaining: number,
) {
  if (destination === 'royalblue' || amount <= 0 || freeTransfersRemaining > 0) return 0;
  if (amount <= 5_000) return 10.75;
  if (amount <= 50_000) return 26.88;
  return 53.75;
}
