import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockAccount, mockUser } from '../mocks/data';
import type { Account, User } from '../types';

export const accountService = {
  getMe(): Promise<User> {
    if (env.useMocks) return mockResponse(mockUser);
    return http.get<User>('/me');
  },

  getAccount(): Promise<Account> {
    if (env.useMocks) return mockResponse(mockAccount);
    return http.get<Account>('/accounts/primary');
  },
};
