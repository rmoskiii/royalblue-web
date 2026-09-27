import type { SavingsSummary, SavingsVault } from '../types';

/** PRD View 4 examples: Rent, Business Expansion, Emergency Fund at 15% p.a. */
export const mockVaults: SavingsVault[] = [
  {
    id: 'vlt_rent',
    name: 'Rent',
    type: 'target',
    balance: 420_000,
    target: 600_000,
    annualRate: 0.15,
    autoSave: { amount: 5_000, frequency: 'weekly' },
    lockedUntil: null,
    createdAt: '2026-03-01T00:00:00.000Z',
  },
  {
    id: 'vlt_biz',
    name: 'Business Expansion',
    type: 'target',
    balance: 450_000,
    target: 1_500_000,
    annualRate: 0.15,
    autoSave: { amount: 50_000, frequency: 'monthly' },
    lockedUntil: null,
    createdAt: '2026-05-10T00:00:00.000Z',
  },
  {
    id: 'vlt_emergency',
    name: 'Emergency Fund',
    type: 'target',
    balance: 200_000,
    target: 250_000,
    annualRate: 0.15,
    autoSave: { amount: 1_000, frequency: 'daily' },
    lockedUntil: null,
    createdAt: '2026-01-15T00:00:00.000Z',
  },
  {
    id: 'vlt_fixed',
    name: 'December lock',
    type: 'fixed',
    balance: 300_000,
    target: null,
    annualRate: 0.15,
    autoSave: null,
    lockedUntil: '2026-12-15T00:00:00.000Z',
    createdAt: '2026-06-15T00:00:00.000Z',
  },
];

export const mockSavingsSummary: Omit<SavingsSummary, 'totalBalance' | 'asOf'> = {
  interestEarned: 48_215.32,
  annualRate: 0.15,
};
