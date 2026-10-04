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
    }>('/auth/me');
    return {
      id: row.id,
      email: row.email,
      firstName: row.firstName ?? row.email.split('@')[0],
      lastName: row.lastName ?? '',
    };
  },

  /** Account for the active profile (personal or business). */
  getAccount(): Promise<Account> {
    if (env.useMocks) {
      return mockResponse(
        getActiveProfileId() === 'prof_business' ? mockBusinessAccount : mockAccount,
      );
    }
    return http.get<Account>('/accounts/primary');
  },
};
