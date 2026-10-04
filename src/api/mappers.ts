import type { Network } from './types';

export const NETWORK_PROVIDER: Record<Network, string> = {
  mtn: 'MTN',
  airtel: 'AIRTEL',
  glo: 'GLO',
  '9mobile': '9MOBILE',
};

export function providerToNetwork(provider: string): Network {
  const key = provider.toLowerCase().replace(/\s+/g, '');
  if (key.includes('airtel')) return 'airtel';
  if (key.includes('glo')) return 'glo';
  if (key.includes('9mobile') || key.includes('etisalat')) return '9mobile';
  return 'mtn';
}

export function discoProvider(discoId: string): string {
  return discoId.toUpperCase();
}
