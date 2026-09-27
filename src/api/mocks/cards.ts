import type { AddressSuggestion, Card, CardSecrets, PhysicalCardOrder } from '../types';

export const mockCards: Card[] = [
  {
    id: 'card_virtual',
    kind: 'virtual',
    scheme: 'visa',
    last4: '4821',
    expiry: '09/29',
    nameOnCard: 'TEMIDAYO ADEYEMI',
    frozen: false,
    controls: { onlinePayments: true, international: false, dailyLimit: 150_000 },
  },
];

export const mockCardSecrets: Record<string, CardSecrets> = {
  card_virtual: { pan: '4187 4512 3456 4821', cvv: '327' },
};

/** null until the customer orders one */
export const mockPhysicalOrder: { current: PhysicalCardOrder | null } = { current: null };

export const mockAddresses: AddressSuggestion[] = [
  { id: 'adr_1', line1: '127 Herbert Macaulay Street, Ebute-Metta', city: 'Yaba', state: 'Lagos' },
  { id: 'adr_2', line1: '14 Admiralty Way, Lekki Phase 1', city: 'Lekki', state: 'Lagos' },
  { id: 'adr_3', line1: '22 Allen Avenue', city: 'Ikeja', state: 'Lagos' },
  {
    id: 'adr_4',
    line1: '5 Adeola Odeku Street, Victoria Island',
    city: 'Victoria Island',
    state: 'Lagos',
  },
  { id: 'adr_5', line1: '31 Aminu Kano Crescent, Wuse 2', city: 'Abuja', state: 'FCT' },
  { id: 'adr_6', line1: '9 Aba Road', city: 'Port Harcourt', state: 'Rivers' },
  { id: 'adr_7', line1: '18 Ring Road', city: 'Ibadan', state: 'Oyo' },
];
