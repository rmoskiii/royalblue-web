import type { Network } from './types';

/** Static reference data the UI needs before any API call. */
export const networks: { id: Network; name: string }[] = [
  { id: 'mtn', name: 'MTN' },
  { id: 'airtel', name: 'Airtel' },
  { id: 'glo', name: 'Glo' },
  { id: '9mobile', name: '9mobile' },
];
