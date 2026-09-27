import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockSavingsSummary, mockVaults } from '../mocks/savings';
import type { CreateVaultRequest, SavingsSummary, SavingsVault } from '../types';

// TODO(api): confirm savings endpoints and whether interest is computed daily or continuously.
export const savingsService = {
  getSummary(): Promise<SavingsSummary> {
    if (env.useMocks) {
      return mockResponse({
        ...mockSavingsSummary,
        totalBalance: mockVaults.reduce((sum, v) => sum + v.balance, 0),
        asOf: new Date().toISOString(),
      });
    }
    return http.get<SavingsSummary>('/savings/summary');
  },

  listVaults(): Promise<SavingsVault[]> {
    if (env.useMocks) return mockResponse(mockVaults);
    return http.get<SavingsVault[]>('/savings/vaults');
  },

  createVault(body: CreateVaultRequest): Promise<SavingsVault> {
    if (env.useMocks) {
      const vault: SavingsVault = {
        id: `vlt_${Date.now()}`,
        ...body,
        balance: 0,
        annualRate: 0.15,
        createdAt: new Date().toISOString(),
      };
      mockVaults.push(vault);
      return mockResponse(vault, 600);
    }
    return http.post<SavingsVault>('/savings/vaults', body);
  },
};
