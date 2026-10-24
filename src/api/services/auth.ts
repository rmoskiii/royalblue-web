import { env } from '@/config/env';
import { ApiError, http, mockResponse, setAccessToken } from '../client';
import { mockUser } from '../mocks/data';
import type {
  CompleteSignUpRequest,
  IdentityLookup,
  IdentityType,
  LoginRequest,
  MfaChallenge,
  PasswordChangeChallenge,
  PhoneVerification,
  SecuritySettings,
  Session,
} from '../types';

type NestLogin = {
  accessToken?: string;
  user?: {
    id?: string;
    sub?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    businessName?: string | null;
    role?: Session['user']['role'];
    mustChangePassword?: boolean;
  };
};

type SignupDraft = {
  phone: string;
  email?: string;
  otp?: string;
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

function isMfaChallenge(
  data: NestLogin | MfaChallenge | PasswordChangeChallenge,
): data is MfaChallenge {
  return 'mfaRequired' in data && data.mfaRequired === true;
}

function isPasswordChangeChallenge(
  data: unknown,
): data is PasswordChangeChallenge {
  if (!data || typeof data !== 'object') return false;
  const row = data as { passwordChangeRequired?: unknown; challengeToken?: unknown };
  return row.passwordChangeRequired === true && typeof row.challengeToken === 'string';
}

function passwordChangeFromError(error: unknown): PasswordChangeChallenge | null {
  if (!(error instanceof ApiError) || error.status !== 422) return null;
  const body = error.body;
  if (isPasswordChangeChallenge(body)) return body;
  if (body && typeof body === 'object' && isPasswordChangeChallenge((body as { message?: unknown }).message)) {
    return (body as { message: PasswordChangeChallenge }).message;
  }
  return null;
}

function toSession(data: NestLogin): Session {
  const id = data.user?.id ?? data.user?.sub ?? '';
  if (!id) {
    throw new Error('Sign in did not return a session. Try again.');
  }
  return {
    user: {
      id,
      firstName: data.user?.firstName ?? data.user?.displayName?.split(' ')[0] ?? 'RoyalBlue',
      lastName: data.user?.lastName ?? '',
      email: data.user?.email ?? '',
      displayName: data.user?.displayName,
      businessName: data.user?.businessName,
      role: data.user?.role ?? 'APPLICANT',
      mustChangePassword: data.user?.mustChangePassword,
    },
  };
}

export const authService = {
  async me() {
    if (env.useMocks) return mockUser;
    const data = await http.get<NestLogin['user'] & { id: string; email: string }>('/auth/me');
    return toSession({ user: data }).user;
  },

  async login(body: LoginRequest): Promise<Session | MfaChallenge | PasswordChangeChallenge> {
    if (env.useMocks) {
      setAccessToken('mock-token');
      return mockResponse({ user: mockUser }, 600);
    }
    try {
      const data = await http.post<NestLogin | MfaChallenge | PasswordChangeChallenge>('/auth/login', body);
      if (isMfaChallenge(data) || isPasswordChangeChallenge(data)) return data;
      return toSession(data);
    } catch (error) {
      const challenge = passwordChangeFromError(error);
      if (challenge) return challenge;
      throw error;
    }
  },

  async logout(): Promise<void> {
    if (env.useMocks) return;
    await http.post('/auth/logout').catch(() => undefined);
  },

  async completeLoginMfa(
    challengeToken: string,
    codes: { totpCode?: string; otp?: string },
  ): Promise<Session> {
    if (env.useMocks) {
      setAccessToken('mock-token');
      return mockResponse({ user: mockUser }, 400);
    }
    const data = await http.post<NestLogin>('/auth/login/mfa', { challengeToken, ...codes });
    return toSession(data);
  },

  async completePasswordUpgrade(
    challengeToken: string,
    currentPassword: string,
    newPassword: string,
    otp: string,
  ): Promise<Session | MfaChallenge> {
    const data = await http.post<NestLogin | MfaChallenge>('/auth/login/password', {
      challengeToken,
      currentPassword,
      newPassword,
      otp,
    });
    if (isMfaChallenge(data)) return data;
    return toSession(data);
  },

  resendPasswordUpgradeOtp(challengeToken: string) {
    return http.post<{ message: string; otp?: string }>('/auth/login/password/otp', { challengeToken });
  },

  requestStaffJoinOtp(email: string) {
    return http.post<{ email: string; message: string; otp?: string }>('/auth/staff/otp', { email });
  },

  async completeStaffJoin(email: string, otp: string, password: string): Promise<Session | MfaChallenge> {
    const data = await http.post<NestLogin | MfaChallenge>('/auth/staff/complete', { email, otp, password });
    if (isMfaChallenge(data)) return data;
    return toSession(data);
  },

  resendLoginOtp(challengeToken: string) {
    if (env.useMocks) {
      return mockResponse({ message: 'We’ve sent a 6-digit code to your email.', otp: '575235' });
    }
    return http.post<{ message: string; otp?: string }>('/auth/login/otp', { challengeToken });
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
        pinLocked: false,
      });
    }
    return http.get('/auth/security');
  },

  requestPasswordChangeOtp(): Promise<{ email?: string; message: string; otp?: string }> {
    if (env.useMocks) {
      return mockResponse({ message: 'We’ve sent a 6-digit code to your email.', otp: '575235' });
    }
    return http.post('/auth/password/otp');
  },

  changePassword(
    currentPassword: string,
    newPassword: string,
    otp: string,
    totpCode?: string,
  ): Promise<{ message: string }> {
    if (env.useMocks) return mockResponse({ message: 'Password updated. Sign in again.' });
    return http.patch('/auth/password', { currentPassword, newPassword, otp, totpCode });
  },

  requestPasswordReset(email: string): Promise<{ email: string; message?: string; otp?: string }> {
    if (env.useMocks) {
      return mockResponse({
        email,
        message: 'If that email is on an account, we sent a 6-digit code.',
        otp: '575235',
      });
    }
    return http.post('/auth/otp/send', { email, purpose: 'reset' });
  },

  verifyEmailOtp(
    email: string,
    otp: string,
    purpose: 'signup' | 'reset' | 'login' = 'signup',
  ): Promise<{ verified: boolean; email: string } | Session> {
    if (env.useMocks) {
      return mockResponse({ verified: true, email });
    }
    return http.post('/auth/otp/verify', { email, otp, purpose });
  },

  resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    if (env.useMocks) {
      return mockResponse({ message: 'Password updated. Sign in with your new password.' });
    }
    return http.post('/auth/forgot/reset', { email, otp, newPassword });
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

  async startEmail(email: string): Promise<{
    email: string;
    otp?: string;
    message?: string;
    mfaRequired?: boolean;
    totpRequired?: boolean;
  }> {
    if (env.useMocks) {
      writeDraft({ ...(readDraft() ?? { phone: '08000000000' }), firstName: mockUser.firstName });
      return mockResponse(
        {
          email,
          otp: '575235',
          message: 'We’ve sent a 6-digit code to your email.',
          mfaRequired: false,
          totpRequired: false,
        },
        400,
      );
    }
    writeDraft({ ...(readDraft() ?? { phone: '08000000000' }) });
    return http.post('/auth/otp/send', { email, purpose: 'signup' });
  },

  verifyPhone(phone: string, code: string): Promise<PhoneVerification> {
    if (env.useMocks) return mockResponse({ signUpToken: 'mock-signup-token' }, 500);
    if (!code) {
      return Promise.reject(new Error('Enter the 6-digit code'));
    }
    writeDraft({ ...(readDraft() ?? { phone }), phone });
    return Promise.resolve({ signUpToken: phone });
  },

  async checkPhoneAvailable(phone: string, email: string, otp?: string) {
    if (env.useMocks) return mockResponse({ available: true, phone }, 200);
    return http.post<{ available: boolean; phone: string }>('/auth/phone-available', {
      phone,
      email,
      otp,
    });
  },

  async lookupIdentity(
    type: IdentityType,
    number: string,
    extras?: {
      phone?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      otp?: string;
      accountKind?: 'personal' | 'business';
    },
  ): Promise<IdentityLookup> {
    if (env.useMocks) {
      return mockResponse(
        {
          firstName: extras?.firstName || mockUser.firstName,
          lastName: extras?.lastName || mockUser.lastName,
          dateOfBirth: '1994-03-12',
          photoUrl: null,
          pending: false,
          verified: true,
        },
        400,
      );
    }
    const draft = readDraft() ?? { phone: extras?.phone ?? '' };
    const lookedUp = await http.post<{
      firstName: string;
      lastName: string;
      dateOfBirth: string | null;
      photoUrl: string | null;
      residentialAddress?: string | null;
      city?: string | null;
      state?: string | null;
      pending?: boolean;
      verified?: boolean;
    }>('/auth/identity-lookup', {
      type,
      number,
      email: extras?.email ?? draft.email,
      otp: extras?.otp ?? draft.otp,
      phone: extras?.phone ?? draft.phone,
      firstName: extras?.firstName,
      lastName: extras?.lastName,
      accountKind: extras?.accountKind,
    });
    writeDraft({
      ...draft,
      email: extras?.email ?? draft.email,
      otp: extras?.otp ?? draft.otp,
      identityType: type,
      identityNumber: number,
      firstName: lookedUp.firstName,
      lastName: lookedUp.lastName,
      dateOfBirth: lookedUp.dateOfBirth ?? undefined,
    });
    return {
      firstName: lookedUp.firstName,
      lastName: lookedUp.lastName,
      dateOfBirth: lookedUp.dateOfBirth,
      photoUrl: lookedUp.photoUrl,
      residentialAddress: lookedUp.residentialAddress ?? null,
      city: lookedUp.city,
      state: lookedUp.state,
      pending: lookedUp.pending,
      verified: lookedUp.verified,
    };
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
      return mockResponse({ user: mockUser }, 800);
    }
    const draft = readDraft();
    try {
      const session = await http.post<NestLogin>('/auth/complete', {
        email: body.email,
        password: body.password,
        phone: body.phone ?? draft?.phone,
        firstName: body.firstName,
        lastName: body.lastName,
        bvn: body.bvn,
        nin: body.nin,
        pin: body.pin,
        accountKind: body.accountKind,
        entityType: body.entityType,
        business: body.business,
        ...(body.signUpToken && body.signUpToken !== '000000' ? { otp: body.signUpToken } : {}),
        ...(body.totpCode?.length === 6 ? { totpCode: body.totpCode } : {}),
      });
      const next = toSession(session);
      try {
        await http.post('/accounts/provision');
      } catch {
        /* VA can wait until BVN/KYC finishes */
      }
      return next;
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setAccessToken(null);
      }
      throw error;
    }
  },
};
