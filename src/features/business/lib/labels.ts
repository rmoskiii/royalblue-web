import type { PaymentChannel } from '@/api/types';

export const channelLabel: Record<PaymentChannel, string> = {
  pos: 'POS',
  web: 'Web',
  transfer: 'Transfer',
};
