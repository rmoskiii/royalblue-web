import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockUser } from '../mocks/data';
import type {
  CompleteSignUpRequest,
  IdentityLookup,
  IdentityType,
  LoginRequest,
  PhoneVerification,
  Session,
  SignUpResult,
} from '../types';

// TODO(api): confirm endpoint paths against the contract.
export const authService = {
  login(body: LoginRequest): Promise<Session> {
    if (env.useMocks) return mockResponse({ accessToken: 'mock-token', user: mockUser }, 600);
    return http.post<Session>('/auth/login', body);
  },

  // ---------- Sign-up (PRD FR-01 / FR-02) ----------

  /** Sends an SMS code to the phone number. */
  startSignUp(phone: string): Promise<void> {
    if (env.useMocks) return mockResponse(undefined, 500);
    return http.post('/auth/signup/phone', { phone });
  },

  verifyPhone(phone: string, code: string): Promise<PhoneVerification> {
    if (env.useMocks) return mockResponse({ signUpToken: 'mock-signup-token' }, 500);
    return http.post('/auth/signup/phone/verify', { phone, code });
  },

  /** Looks up the customer's details from NIBSS using their BVN or NIN. */
  lookupIdentity(signUpToken: string, type: IdentityType, number: string): Promise<IdentityLookup> {
    if (env.useMocks) {
      return mockResponse(
        {
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          dateOfBirth: '1994-03-12',
          photoUrl: null,
        },
        900,
      );
    }
    return http.post('/auth/signup/identity', { signUpToken, type, number });
  },

  /** Creates login details and issues the account number. */
  completeSignUp(body: CompleteSignUpRequest): Promise<SignUpResult> {
    if (env.useMocks) {
      return mockResponse(
        { accountNumber: '7823456109', accountName: `${mockUser.firstName} ${mockUser.lastName}` },
        800,
      );
    }
    return http.post('/auth/signup/complete', body);
  },
};
