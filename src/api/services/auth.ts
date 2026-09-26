import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockUser } from '../mocks/data';
import type { LoginRequest, Session, SignUpRequest } from '../types';

// TODO(api): confirm endpoint paths against the contract.
export const authService = {
  login(body: LoginRequest): Promise<Session> {
    if (env.useMocks) return mockResponse({ accessToken: 'mock-token', user: mockUser }, 600);
    return http.post<Session>('/auth/login', body);
  },

  signUp(body: SignUpRequest): Promise<{ email: string }> {
    if (env.useMocks) return mockResponse({ email: body.email }, 600);
    return http.post('/auth/signup', body);
  },

  verifyEmail(email: string, code: string): Promise<void> {
    if (env.useMocks) return mockResponse(undefined, 500);
    return http.post('/auth/verify-email', { email, code });
  },

  createPassword(email: string, password: string): Promise<void> {
    if (env.useMocks) return mockResponse(undefined, 500);
    return http.post('/auth/password', { email, password });
  },
};
