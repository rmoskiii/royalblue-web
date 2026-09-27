import type { BusinessSummary, PosTerminal, Profile, Settlement, StaffMember } from '../types';

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

/** PRD View 2 figures */
export const mockBusinessSummary: BusinessSummary = {
  todayVolume: 4_850_000,
  pendingPayout: 320_000,
  terminalsActive: 2,
  terminalsOnline: 2,
};

export const mockTerminals: PosTerminal[] = [
  {
    id: 'pos_1',
    serial: 'RB-POS-20417',
    label: 'Front counter',
    status: 'online',
    lastTransactionAt: minutesAgo(3),
  },
  {
    id: 'pos_2',
    serial: 'RB-POS-20418',
    label: 'Repairs desk',
    status: 'online',
    lastTransactionAt: minutesAgo(26),
  },
];

export const mockSettlements: Settlement[] = [
  {
    id: 'st_01',
    createdAt: minutesAgo(3),
    customerName: 'Ngozi Eze',
    channel: 'pos',
    amount: 45_000,
    status: 'success',
    terminalId: 'pos_1',
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
    channel: 'web',
    amount: 18_500,
    status: 'pending',
  },
  {
    id: 'st_04',
    createdAt: minutesAgo(26),
    customerName: 'Chinedu Obi',
    channel: 'pos',
    amount: 120_000,
    status: 'success',
    terminalId: 'pos_2',
  },
  {
    id: 'st_05',
    createdAt: minutesAgo(41),
    customerName: 'Funmi Adebayo',
    channel: 'pos',
    amount: 7_500,
    status: 'success',
    terminalId: 'pos_1',
  },
  {
    id: 'st_06',
    createdAt: minutesAgo(58),
    customerName: 'Musa Ibrahim',
    channel: 'web',
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
    channel: 'pos',
    amount: 32_000,
    status: 'success',
    terminalId: 'pos_2',
  },
];

export const mockStaff: StaffMember[] = [
  {
    id: 'stf_1',
    name: 'Blessing Okon',
    email: 'blessing@adeyemitech.ng',
    phone: '+2348091234567',
    role: 'cashier',
    status: 'active',
    addedAt: '2026-08-14T09:00:00.000Z',
  },
  {
    id: 'stf_2',
    name: 'Samuel Etim',
    email: 'samuel@adeyemitech.ng',
    phone: '+2348127654321',
    role: 'cashier',
    status: 'invited',
    addedAt: '2026-09-25T15:30:00.000Z',
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
