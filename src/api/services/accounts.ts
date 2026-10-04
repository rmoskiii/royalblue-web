import { env } from '@/config/env';
import { getActiveProfileId, http, mockResponse } from '../client';
import { mockAccount, mockBusinessAccount, mockUser } from '../mocks/data';
import type { Account, User } from '../types';

export const accountService = {
  async getMe(): Promise<User> {
    if (env.useMocks) return mockResponse(mockUser);
    const row = await http.get<{
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
      displayName?: string;
      businessName?: string | null;
      role?: User['role'];
    }>('/auth/me');
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName ?? row.displayName?.split(' ')[0] ?? row.email.split('@')[0],
      lastName: row.lastName ?? '',
      displayName: row.displayName,
      businessName: row.businessName,
      role: row.role ?? 'APPLICANT',
    };
  },

  /** Account for the active profile (personal or business). */
  async getAccount(): Promise<Account> {
    if (env.useMocks) {
      return mockResponse(
        getActiveProfileId() === 'prof_business' ? mockBusinessAccount : mockAccount,
      );
    }
    return http.get<Account>('/accounts/primary');
  },

  sandboxFund(amount = 50_000): Promise<{ account: Account; amount: number; reference: string }> {
    if (env.useMocks) {
      return mockResponse({
        account: { ...mockAccount, balance: mockAccount.balance + amount, sandbox: true },
        amount,
        reference: `va_sandbox_${Date.now()}`,
      });
    }
    return http.post('/accounts/sandbox-fund', { amount });
  },

  startCardTopup(amount = 5_000): Promise<{ authorizationUrl: string; reference: string; amount: number }> {
    if (env.useMocks) {
      return mockResponse({
        authorizationUrl: `${window.location.origin}/dashboard?reference=card_mock&status=success`,
        reference: 'card_mock',
        amount,
      });
    }
    return http.post('/accounts/card-topup', { amount });
  },

  verifyCardTopup(reference: string): Promise<{ account: Account; amount: number; reference: string }> {
    if (env.useMocks) {
      return mockResponse({
        account: { ...mockAccount, balance: mockAccount.balance + 5_000, sandbox: true },
        amount: 5_000,
        reference,
      });
    }
    return http.post('/accounts/card-topup/verify', { reference });
  },
};
