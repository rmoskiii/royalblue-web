import { env } from '@/config/env';
import { getActiveProfileId, http, mockResponse } from '../client';
import { mockAccount, mockBusinessAccount, mockUser } from '../mocks/data';
import type { Account, User } from '../types';

export const accountService = {
  getMe(): Promise<User> {
    if (env.useMocks) return mockResponse(mockUser);
    return http.get<User>('/me');
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
