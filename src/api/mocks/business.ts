import type { BusinessSummary, Profile, Settlement } from '../types';

function minutesAgo(m: number) {
  return new Date(Date.now() - m * 60_000).toISOString();
}

export const mockProfiles: Profile[] = [
  { id: 'prof_personal', type: 'personal', name: 'Temidayo Adeyemi', accountNumber: '7823456109' },
  {
    id: 'prof_business',
    type: 'business',
    name: 'Adeyemi Tech Hub Enterprise',
    accountNumber: '7823456117',
  },
];

export const mockBusinessSummary: BusinessSummary = {
  todayVolume: 4_850_000,
  pendingPayout: 320_000,
};

export const mockSettlements: Settlement[] = [
  {
    id: 'st_01',
    createdAt: minutesAgo(3),
    customerName: 'Ngozi Eze',
    channel: 'transfer',
    amount: 45_000,
    status: 'success',
  },
  {
    id: 'st_02',
    createdAt: minutesAgo(9),
    customerName: 'Babatunde Lawal',
    channel: 'transfer',
    amount: 250_000,
    status: 'success',
  },
  {
    id: 'st_03',
    createdAt: minutesAgo(17),
    customerName: 'Halima Yusuf',
    channel: 'transfer',
    amount: 18_500,
    status: 'pending',
  },
  {
    id: 'st_04',
    createdAt: minutesAgo(26),
    customerName: 'Chinedu Obi',
    channel: 'transfer',
    amount: 120_000,
    status: 'success',
  },
  {
    id: 'st_05',
    createdAt: minutesAgo(41),
    customerName: 'Funmi Adebayo',
    channel: 'transfer',
    amount: 7_500,
    status: 'success',
  },
  {
    id: 'st_06',
    createdAt: minutesAgo(58),
    customerName: 'Musa Ibrahim',
    channel: 'transfer',
    amount: 64_000,
    status: 'success',
  },
  {
    id: 'st_07',
    createdAt: minutesAgo(73),
    customerName: 'Kelechi Nnaji',
    channel: 'transfer',
    amount: 300_000,
    status: 'pending',
  },
  {
    id: 'st_08',
    createdAt: minutesAgo(95),
    customerName: 'Aisha Bello',
    channel: 'transfer',
    amount: 32_000,
    status: 'success',
  },
];

/** Names used when the mock stream invents a new incoming payment */
export const mockCustomerNames = [
  'Oluwaseun Ajayi',
  'Emeka Okafor',
  'Zainab Musa',
  'Tolu Akinola',
  'Ifeoma Nwosu',
  'Yusuf Garba',
  'Adaeze Obi',
  'Segun Bakare',
  'Hauwa Sani',
  'Uche Madu',
];
