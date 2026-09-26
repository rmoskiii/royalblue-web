import type {
  Account,
  Bank,
  Beneficiary,
  InsightsSummary,
  Loan,
  LoanProduct,
  Transaction,
  User,
  VerificationStatus,
} from '../types';

/**
 * Sample data used while VITE_USE_MOCKS is on.
 * Names and figures follow the Figma so screens match the designs.
 */

function daysAgo(days: number, hour: number, minute: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const mockUser: User = {
  id: 'usr_001',
  firstName: 'Temidayo',
  lastName: 'Adeyemi',
  email: 'temidayo@example.com',
};

export const mockAccount: Account = {
  accountNumber: '7823456109',
  accountName: 'Temidayo Adeyemi',
  bankName: 'RoyalBlue MFB',
  balance: 12_000_345,
  tier: 2,
};

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_01',
    title: 'Salary Credit',
    counterparty: 'Access Bank',
    amount: 80_000,
    direction: 'credit',
    status: 'successful',
    category: 'income',
    fee: 0,
    reference: 'RB260926008841',
    createdAt: daysAgo(0, 9, 14),
  },
  {
    id: 'tx_02',
    title: 'MTN Airtime',
    counterparty: '080 *** 4521',
    amount: 1_000,
    direction: 'debit',
    status: 'successful',
    category: 'airtime',
    fee: 0,
    reference: 'RB260926008842',
    createdAt: daysAgo(0, 8, 2),
  },
  {
    id: 'tx_03',
    title: 'Electricity Bill',
    counterparty: 'EKEDC prepaid',
    amount: 15_000,
    direction: 'debit',
    status: 'successful',
    category: 'bills',
    fee: 0,
    reference: 'RB260925008843',
    createdAt: daysAgo(1, 18, 45),
  },
  {
    id: 'tx_04',
    title: 'Wallet Funding',
    counterparty: 'GTBank',
    amount: 20_000,
    direction: 'credit',
    status: 'successful',
    category: 'funding',
    fee: 0,
    reference: 'RB260925008844',
    createdAt: daysAgo(1, 14, 30),
  },
  {
    id: 'tx_05',
    title: 'Shoprite Purchase',
    counterparty: 'Card payment',
    amount: 8_500,
    direction: 'debit',
    status: 'pending',
    category: 'shopping',
    fee: 0,
    reference: 'RB260924008845',
    createdAt: daysAgo(2, 15, 22),
  },
  {
    id: 'tx_06',
    title: 'Transfer to Emeka O.',
    counterparty: 'Zenith Bank',
    amount: 5_000,
    direction: 'debit',
    status: 'successful',
    category: 'transfer',
    fee: 10.75,
    reference: 'RB260924008846',
    createdAt: daysAgo(2, 11, 0),
  },
  {
    id: 'tx_07',
    title: 'DStv Subscription',
    counterparty: 'MultiChoice',
    amount: 15_700,
    direction: 'debit',
    status: 'successful',
    category: 'bills',
    fee: 0,
    reference: 'RB260921008847',
    createdAt: daysAgo(5, 19, 10),
  },
  {
    id: 'tx_08',
    title: 'Transfer from Aisha Bello',
    counterparty: 'UBA',
    amount: 45_000,
    direction: 'credit',
    status: 'successful',
    category: 'transfer',
    fee: 0,
    reference: 'RB260919008848',
    createdAt: daysAgo(7, 13, 48),
  },
  {
    id: 'tx_09',
    title: 'Loan Repayment',
    counterparty: 'Working Capital · 4 of 12',
    amount: 141_839,
    direction: 'debit',
    status: 'successful',
    category: 'loan',
    fee: 0,
    reference: 'RB260905008849',
    createdAt: daysAgo(21, 8, 0),
  },
];

export const mockInsights: InsightsSummary = {
  periodLabel: 'This month so far',
  moneyIn: 585_000,
  moneyOut: 412_300,
  breakdown: [
    { category: 'Loan repayment', share: 0.34 },
    { category: 'Transfers', share: 0.26 },
    { category: 'Bills', share: 0.22 },
    { category: 'Shopping', share: 0.12 },
    { category: 'Airtime and data', share: 0.06 },
  ],
};

export const mockBanks: Bank[] = [
  { code: '044', name: 'Access Bank' },
  { code: '214', name: 'FCMB' },
  { code: '058', name: 'GTBank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '033', name: 'UBA' },
  { code: '057', name: 'Zenith Bank' },
];

export const mockBeneficiaries: Beneficiary[] = [
  {
    id: 'ben_1',
    name: 'Chiamaka Okafor',
    accountNumber: '0123456789',
    bankCode: '076',
    bankName: 'Polaris Bank',
  },
  {
    id: 'ben_2',
    name: 'Tunde Adebayo',
    accountNumber: '0234567891',
    bankCode: '044',
    bankName: 'Access Bank',
  },
  {
    id: 'ben_3',
    name: 'Aisha Bello',
    accountNumber: '2034567812',
    bankCode: '033',
    bankName: 'UBA',
  },
  {
    id: 'ben_4',
    name: 'Ikenna Nwosu',
    accountNumber: '6012345678',
    bankCode: '082',
    bankName: 'Keystone Bank',
  },
  {
    id: 'ben_5',
    name: 'Zainab Musa',
    accountNumber: '5123456780',
    bankCode: '214',
    bankName: 'FCMB',
  },
  {
    id: 'ben_6',
    name: 'Efe Omoregie',
    accountNumber: '6098765432',
    bankCode: '082',
    bankName: 'Keystone Bank',
  },
];

/** Placeholder limits and rates until the API contract confirms them. */
export const mockLoanProducts: LoanProduct[] = [
  {
    id: 'working-capital',
    name: 'Working Capital',
    description: 'Restock, pay suppliers and keep the business moving.',
    maxAmount: 10_000_000,
    tenorOptions: [3, 6, 9, 12],
    monthlyRate: 0.02,
  },
  {
    id: 'asset-leasing',
    name: 'Asset Leasing',
    description: 'Get equipment or vehicles now and pay monthly.',
    maxAmount: 10_000_000,
    tenorOptions: [6, 9, 12],
    monthlyRate: 0.02,
  },
  {
    id: 'lpo-financing',
    name: 'LPO Financing',
    description: 'Fund confirmed purchase orders and deliver on time.',
    maxAmount: 10_000_000,
    tenorOptions: [3, 6],
    monthlyRate: 0.02,
  },
  {
    id: 'instant-loan',
    name: 'Instant Loan',
    description: 'Quick personal credit based on your account history.',
    maxAmount: 5_000_000,
    tenorOptions: [3, 6],
    monthlyRate: 0.02,
  },
];

export const mockLoans: Loan[] = [
  {
    id: 'loan_001',
    productId: 'working-capital',
    productName: 'Working Capital Loan',
    principal: 1_500_000,
    monthlyRate: 0.02,
    tenorMonths: 12,
    disbursedAt: '2026-05-05T09:00:00.000Z',
    firstRepaymentAt: '2026-06-05T08:00:00.000Z',
    repaymentsMade: 4,
    status: 'active',
    autoDebit: true,
  },
];

export const mockVerification: VerificationStatus = {
  tier: 2,
  completedSteps: ['account-type', 'bvn', 'id-document'],
};
