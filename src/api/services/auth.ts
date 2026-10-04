import { env } from '@/config/env';
import { http, mockResponse, setAccessToken } from '../client';
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

type NestLogin = {
  accessToken: string;
  user?: {
    id?: string;
    sub?: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
};

type NestRegister = {
  email: string;
  otp?: string;
  message?: string;
};

type SignupDraft = {
  phone: string;
  identityType?: IdentityType;
  identityNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
};

const SIGNUP_KEY = 'rb.signup.draft';

function readDraft(): SignupDraft | null {
  try {
    const raw = sessionStorage.getItem(SIGNUP_KEY);
    return raw ? (JSON.parse(raw) as SignupDraft) : null;
  } catch {
    return null;
  }
}

function writeDraft(draft: SignupDraft) {
  sessionStorage.setItem(SIGNUP_KEY, JSON.stringify(draft));
}

function toSession(data: NestLogin): Session {
  return {
    accessToken: data.accessToken,
    user: {
      id: data.user?.id ?? data.user?.sub ?? '',
      firstName: data.user?.firstName ?? 'RoyalBlue',
      lastName: data.user?.lastName ?? 'Customer',
      email: data.user?.email ?? '',
    },
  };
}

export const authService = {
  async login(body: LoginRequest): Promise<Session> {
    if (env.useMocks) return mockResponse({ accessToken: 'mock-token', user: mockUser }, 600);
    const data = await http.post<NestLogin>('/auth/login', body);
    return toSession(data);
  },

  startSignUp(phone: string): Promise<void> {
    if (env.useMocks) return mockResponse(undefined, 500);
    writeDraft({ phone });
    return Promise.resolve();
  },

  verifyPhone(phone: string, code: string): Promise<PhoneVerification> {
    if (env.useMocks) return mockResponse({ signUpToken: 'mock-signup-token' }, 500);
    if (!code) {
      return Promise.reject(new Error('Enter the 6-digit code'));
    }
    writeDraft({ ...(readDraft() ?? { phone }), phone });
    return Promise.resolve({ signUpToken: phone });
  },

  lookupIdentity(
    signUpToken: string,
    type: IdentityType,
    number: string,
  ): Promise<IdentityLookup> {
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
    writeDraft({
      ...(readDraft() ?? { phone: signUpToken }),
      identityType: type,
      identityNumber: number,
      firstName: 'Pending',
      lastName: 'Customer',
      dateOfBirth: '1990-01-01',
    });
    return Promise.resolve({
      firstName: 'Pending',
      lastName: 'Customer',
      dateOfBirth: '1990-01-01',
      photoUrl: null,
    });
  },

  async completeSignUp(body: CompleteSignUpRequest): Promise<SignUpResult> {
    if (env.useMocks) {
      return mockResponse(
        { accountNumber: '7823456109', accountName: `${mockUser.firstName} ${mockUser.lastName}` },
        800,
      );
    }
    const draft = readDraft();
    const phone = draft?.phone ?? '08000000000';
    const bvn = draft?.identityType === 'bvn' ? draft.identityNumber : '00000000000';
    if (!bvn || !/^\d{11}$/.test(bvn)) {
      throw new Error('BVN is required to open an account on the live API');
    }
    const registered = await http.post<NestRegister>('/auth/register', {
      email: body.email,
      password: body.password,
      phone,
      bvn,
      firstName: draft?.firstName,
      lastName: draft?.lastName,
      dateOfBirth: draft?.dateOfBirth,
    });
    if (registered.otp) {
      const session = await http.post<NestLogin>('/auth/verify-otp', {
        email: body.email,
        otp: registered.otp,
      });
      setAccessToken(session.accessToken);
      try {
        const account = await http.post<{ accountNumber: string; accountName: string }>(
          '/accounts/provision',
        );
        return { accountNumber: account.accountNumber, accountName: account.accountName };
      } finally {
        setAccessToken(null);
      }
    }
    return {
      accountNumber: 'pending',
      accountName: 'Verify the email OTP, then sign in to finish account opening',
    };
  },
};
