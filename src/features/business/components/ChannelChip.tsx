import type { PaymentChannel, SettlementStatus } from '@/api/types';
import { Chip } from '@/components/ui';
import { channelLabel } from '../lib/labels';

export function ChannelChip({ channel }: { channel: PaymentChannel }) {
  return <Chip tone="neutral">{channelLabel[channel]}</Chip>;
}

export function SettlementStatusChip({ status }: { status: SettlementStatus }) {
  return status === 'success' ? (
    <Chip tone="success">Success</Chip>
  ) : (
    <Chip tone="warning">Pending</Chip>
  );
}
