import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockProfiles } from '../mocks/business';
import type { Profile } from '../types';

export const profileService = {
  /** Personal profile plus any business profiles the customer owns (PRD FR-04). */
  list(): Promise<Profile[]> {
    if (env.useMocks) return mockResponse(mockProfiles, 200);
    return http.get<Profile[]>('/profiles');
  },
};
