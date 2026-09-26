import type { TransferDestination } from '@/api/types';

/**
 * NIP transfer fee bands (CBN guide). RoyalBlue-to-RoyalBlue is free.
 * TODO(api): replace with the fee returned by the API so pricing lives server-side.
 */
export function transferFee(amount: number, destination: TransferDestination) {
  if (destination === 'royalblue' || amount <= 0) return 0;
  if (amount <= 5_000) return 10.75;
  if (amount <= 50_000) return 26.88;
  return 53.75;
}
