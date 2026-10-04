import { env } from '@/config/env';
import { http, mockResponse, setAccessToken } from '../client';
import { mockUser } from '../mocks/data';
import type {
  CompleteSignUpRequest,
  IdentityLookup,
  IdentityType,
  LoginRequest,
  MfaChallenge,
  PhoneVerification,
  SecuritySettings,
  Session,
} from '../types';

type NestLogin = {
  accessToken: string;
  user?: {
    id?: string;
    sub?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    businessName?: string | null;
    role?: Session['user']['role'];
  };
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

function isMfaChallenge(data: NestLogin | MfaChallenge): data is MfaChallenge {
  return 'mfaRequired' in data && data.mfaRequired === true;
}

function toSession(data: NestLogin): Session {
  return {
    accessToken: data.accessToken,
    user: {
      id: data.user?.id ?? data.user?.sub ?? '',
      firstName: data.user?.firstName ?? data.user?.displayName?.split(' ')[0] ?? 'RoyalBlue',
      lastName: data.user?.lastName ?? '',
      email: data.user?.email ?? '',
      displayName: data.user?.displayName,
      businessName: data.user?.businessName,
      role: data.user?.role ?? 'APPLICANT',
    },
  };
}

export const authService = {
  async login(body: LoginRequest): Promise<Session | MfaChallenge> {
    if (env.useMocks) return mockResponse({ accessToken: 'mock-token', user: mockUser }, 600);
    const data = await http.post<NestLogin | MfaChallenge>('/auth/login', body);
    if (isMfaChallenge(data)) return data;
    return toSession(data);
  },

  async completeLoginMfa(challengeToken: string, totpCode: string): Promise<Session> {
    if (env.useMocks) return mockResponse({ accessToken: 'mock-token', user: mockUser }, 400);
    const data = await http.post<NestLogin>('/auth/login/mfa', { challengeToken, totpCode });
    return toSession(data);
  },

  async beginSignupMfa(email: string, otp: string) {
    if (env.useMocks) {
      return mockResponse(
        {
          secret: 'JBSWY3DPEHPK3PXP',
          otpauthUrl: `otpauth://totp/RoyalBlue:${email}?secret=JBSWY3DPEHPK3PXP&issuer=RoyalBlue`,
        },
        300,
      );
    }
    return http.post<{ secret: string; otpauthUrl: string }>('/auth/mfa/begin', { email, otp });
  },

  async getSecurity(): Promise<SecuritySettings> {
    if (env.useMocks) {
      return mockResponse({
        totpEnabled: true,
        pinSet: true,
        loginAlertsEnabled: true,
        transactionAlertsEnabled: true,
        marketingEmailsEnabled: false,
        passwordSet: true,
        biometricsAvailable: false,
      });
    }
    return http.get('/auth/security');
  },

  changePassword(currentPassword: string, newPassword: string) {
    if (env.useMocks) return mockResponse({ message: 'Password updated' });
    return http.patch('/auth/password', { currentPassword, newPassword });
  },

  setPin(pin: string, currentPin?: string) {
    if (env.useMocks) return mockResponse({ pinSet: true });
    return http.patch('/auth/pin', { pin, currentPin });
  },

  beginTotp() {
    if (env.useMocks) {
      return mockResponse({
        secret: 'JBSWY3DPEHPK3PXP',
        otpauthUrl: 'otpauth://totp/RoyalBlue:demo?secret=JBSWY3DPEHPK3PXP&issuer=RoyalBlue',
      });
    }
    return http.post<{ secret: string; otpauthUrl: string }>('/auth/totp/begin', {});
  },

  confirmTotp(totpCode: string) {
    if (env.useMocks) return mockResponse({ totpEnabled: true });
    return http.post('/auth/totp/confirm', { totpCode });
  },

  disableTotp(totpCode: string) {
    if (env.useMocks) return mockResponse({ totpEnabled: false });
    return http.post('/auth/totp/disable', { totpCode });
  },

  setAlerts(body: {
    loginAlertsEnabled?: boolean;
    transactionAlertsEnabled?: boolean;
    marketingEmailsEnabled?: boolean;
  }) {
    if (env.useMocks) return mockResponse(body);
    return http.patch('/auth/alerts', body);
  },

  startSignUp(phone: string): Promise<void> {
    if (env.useMocks) return mockResponse(undefined, 500);
    writeDraft({ phone });
    return Promise.resolve();
  },

  async startEmail(email: string): Promise<{ email: string; otp?: string; message?: string }> {
    if (env.useMocks) {
      writeDraft({ ...(readDraft() ?? { phone: '08000000000' }), firstName: mockUser.firstName });
      return mockResponse({ email, otp: '575235', message: 'We’ve sent a 6-digit code to your email.' }, 400);
    }
    writeDraft({ ...(readDraft() ?? { phone: '08000000000' }) });
    return http.post('/auth/start', { email });
  },

  verifyPhone(phone: string, code: string): Promise<PhoneVerification> {
    if (env.useMocks) return mockResponse({ signUpToken: 'mock-signup-token' }, 500);
    if (!code) {
      return Promise.reject(new Error('Enter the 6-digit code'));
    }
    writeDraft({ ...(readDraft() ?? { phone }), phone });
    return Promise.resolve({ signUpToken: phone });
  },

  async lookupIdentity(
    type: IdentityType,
    number: string,
    extras?: { phone?: string; firstName?: string; lastName?: string },
  ): Promise<IdentityLookup> {
    if (env.useMocks) {
      return mockResponse(
        {
          firstName: extras?.firstName || mockUser.firstName,
          lastName: extras?.lastName || mockUser.lastName,
          dateOfBirth: '1994-03-12',
          photoUrl: null,
          pending: false,
        },
        400,
      );
    }
    const draft = readDraft() ?? { phone: extras?.phone ?? '' };
    try {
      const lookedUp = await http.post<{
        firstName: string;
        lastName: string;
        dateOfBirth: string;
        photoUrl: string | null;
        pending?: boolean;
      }>('/auth/identity-lookup', {
        type,
        number,
        phone: extras?.phone ?? draft.phone,
        firstName: extras?.firstName,
        lastName: extras?.lastName,
      });
      writeDraft({
        ...draft,
        identityType: type,
        identityNumber: number,
        firstName: lookedUp.firstName,
        lastName: lookedUp.lastName,
        dateOfBirth: lookedUp.dateOfBirth,
      });
      return {
        firstName: lookedUp.firstName,
        lastName: lookedUp.lastName,
        dateOfBirth: lookedUp.dateOfBirth,
        photoUrl: lookedUp.photoUrl,
        pending: lookedUp.pending,
      };
    } catch {
      return {
        firstName: extras?.firstName || 'Pending',
        lastName: extras?.lastName || 'Customer',
        dateOfBirth: '1990-01-01',
        photoUrl: null,
        pending: true,
      };
    }
  },

  async lookupCac(registrationNumber: string, type?: string) {
    if (env.useMocks) {
      return mockResponse(
        {
          registeredName: 'Adeyemi Tech Hub Enterprise',
          tradeName: 'Adeyemi Tech Hub',
          registrationNumber,
          sandbox: true,
        },
        700,
      );
    }
    return http.post<{
      registeredName?: string;
      tradeName?: string;
      registrationNumber?: string;
      sandbox?: boolean;
    }>('/auth/cac-lookup', { registrationNumber, type });
  },

  async completeSignUp(body: CompleteSignUpRequest): Promise<Session> {
    if (env.useMocks) {
      setAccessToken('mock-token');
      return mockResponse({ accessToken: 'mock-token', user: mockUser }, 800);
    }
    const draft = readDraft();
    const session = await http.post<NestLogin>('/auth/complete', {
      email: body.email,
      otp: body.signUpToken,
      password: body.password,
      phone: body.phone ?? draft?.phone,
      firstName: body.firstName,
      lastName: body.lastName,
      bvn: body.bvn,
      nin: body.nin,
      pin: body.pin,
      totpCode: body.totpCode,
      accountKind: body.accountKind,
      entityType: body.entityType,
      business: body.business,
    });
    const next = toSession(session);
    setAccessToken(next.accessToken);
    try {
      await http.post('/accounts/provision');
    } catch {
      /* VA can wait until BVN/KYC finishes */
    }
    return next;
  },
};
