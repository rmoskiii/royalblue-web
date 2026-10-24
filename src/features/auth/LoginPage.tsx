import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { authService } from '@/api/services/auth';
import type { MfaChallenge, PasswordChangeChallenge } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths, homePathForRole } from '@/components/layout/navigation';
import { Button, TextField } from '@/components/ui';
import { CodeInput } from './components/CodeInput';
import { PasswordChecklist } from './components/PasswordChecklist';
import { PasswordField } from './components/PasswordField';
import { passwordIsValid } from './lib/passwordRules';
import { submitOnEnter } from './lib/submitOnEnter';
import { demo } from '@/config/demo';

export function LoginPage() {
  const { establishSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from;

  const [identifier, setIdentifier] = useState(demo?.login.email ?? '');
  const [password, setPassword] = useState(demo?.login.password ?? '');
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [passwordChange, setPasswordChange] = useState<PasswordChangeChallenge | null>(null);
  const [nextPassword, setNextPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [upgradeOtp, setUpgradeOtp] = useState('');
  const [totp, setTotp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const upgradeOtpSent = useRef(false);

  const goIn = (session: Awaited<ReturnType<typeof authService.completeLoginMfa>>) => {
    establishSession(session);
    if (redirectTo && redirectTo !== paths.home) {
      navigate(redirectTo, { replace: true });
      return;
    }
    navigate(homePathForRole(session.user.role), { replace: true });
  };

  const submit = useMutation({
    mutationFn: async () => {
      const result = await authService.login({ identifier: identifier.trim(), password });
      if ('passwordChangeRequired' in result && result.passwordChangeRequired) {
        setPasswordChange(result);
        setUpgradeOtp(result.otp ?? '');
        return 'password' as const;
      }
      if ('mfaRequired' in result && result.mfaRequired) {
        setChallenge(result);
        return 'mfa' as const;
      }
      if (!('user' in result) || !result.user) {
        throw new Error('Authenticator code required');
      }
      goIn(result);
      return 'ok' as const;
    },
  });

  const upgrade = useMutation({
    mutationFn: () =>
      authService.completePasswordUpgrade(
        passwordChange!.challengeToken,
        password,
        nextPassword,
        upgradeOtp,
      ),
    onSuccess: (result) => {
      if ('mfaRequired' in result && result.mfaRequired) {
        setPasswordChange(null);
        setChallenge(result);
        return;
      }
      if ('user' in result) goIn(result);
    },
  });

  const verify = useMutation({
    mutationFn: () =>
      authService.completeLoginMfa(challenge!.challengeToken, {
        totpCode: challenge!.methods.includes('totp') ? totp : undefined,
        otp: challenge!.methods.includes('otp') ? emailOtp || undefined : undefined,
      }),
    onSuccess: (session) => {
      goIn(session);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit.mutate();
  };

  useEffect(() => {
    if (!passwordChange || upgradeOtpSent.current) return;
    upgradeOtpSent.current = true;
    void authService.resendPasswordUpgradeOtp(passwordChange.challengeToken).then((result) => {
      if (result.otp) setUpgradeOtp(result.otp);
    });
  }, [passwordChange]);

  if (passwordChange) {
    const matches = nextPassword === confirmPassword;
    const valid = passwordIsValid(nextPassword) && matches && upgradeOtp.length === 6;
    return (
      <AuthCard
        title="Update your password"
        subtitle={`This account still uses a password that is too simple. We emailed a code to ${passwordChange.email}.`}
      >
        <form
          className="grid gap-4"
          onKeyDown={submitOnEnter}
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) upgrade.mutate();
          }}
        >
          <PasswordField
            label="New password"
            autoComplete="new-password"
            value={nextPassword}
            onChange={(e) => setNextPassword(e.target.value)}
          />
          <PasswordChecklist value={nextPassword} />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword && !matches ? 'Passwords don’t match.' : undefined}
          />
          <CodeInput label="Email code" value={upgradeOtp} onChange={setUpgradeOtp} />
          <button
            type="button"
            className="justify-self-start text-sm font-medium text-brand"
            onClick={() => {
              void authService.resendPasswordUpgradeOtp(passwordChange.challengeToken).then((result) => {
                if (result.otp) setUpgradeOtp(result.otp);
              });
            }}
          >
            Send a new code
          </button>
          {upgrade.isError && <p className="text-[13px] text-primary-text">{upgrade.error.message}</p>}
          <Button type="submit" size="lg" block disabled={!valid || upgrade.isPending}>
            {upgrade.isPending ? 'Saving…' : 'Save and continue'}
          </Button>
          <button type="button" className="text-sm font-medium text-ink-2" onClick={() => setPasswordChange(null)}>
            Use a different account
          </button>
        </form>
      </AuthCard>
    );
  }

  if (challenge) {
    const totpOnly = challenge.methods.includes('totp');
    const otpOnly = challenge.methods.includes('otp') && !totpOnly;
    const ready = totpOnly ? totp.length === 6 : emailOtp.length === 6;
    return (
      <AuthCard
        title={totpOnly ? 'Authenticator code' : 'Check your email'}
        subtitle={
          totpOnly
            ? 'Open Google Authenticator and enter the 6-digit code.'
            : `We emailed a 6-digit code to ${challenge.email}. New browsers need this after your password.`
        }
      >
        <form
          className="grid gap-4"
          onKeyDown={submitOnEnter}
          onSubmit={(e) => {
            e.preventDefault();
            if (ready) verify.mutate();
          }}
        >
          {totpOnly ? (
            <CodeInput label="Authenticator code" value={totp} onChange={setTotp} />
          ) : (
            <CodeInput label="Email code" value={emailOtp} onChange={setEmailOtp} />
          )}
          {otpOnly && (
            <button
              type="button"
              className="text-sm font-medium text-brand"
              onClick={() => {
                void authService.resendLoginOtp(challenge.challengeToken).then((result) => {
                  if (result.otp) setEmailOtp(result.otp);
                });
              }}
            >
              Send a new code
            </button>
          )}
          {verify.isError && <p className="text-[13px] text-primary-text">{verify.error.message}</p>}
          <Button type="submit" size="lg" block disabled={!ready || verify.isPending}>
            {verify.isPending ? 'Checking…' : 'Verify'}
          </Button>
          <button type="button" className="text-sm font-medium text-ink-2" onClick={() => setChallenge(null)}>
            Use a different account
          </button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Log in to RoyalBlue" subtitle="Use your email or phone number, then your password">
      <form className="grid gap-4" onKeyDown={submitOnEnter} onSubmit={handleSubmit}>
        <TextField
          label="Email or phone number"
          type="text"
          inputMode="email"
          autoComplete="username"
          autoFocus
          placeholder="you@email.com or 0803 456 4521"
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <div className="grid gap-2">
          <PasswordField
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="text-right text-[13px]">
            <Link to={paths.forgot} className="font-medium text-brand">
              Forgot password
            </Link>
          </p>
        </div>
        {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!identifier.trim() || !password || submit.isPending}>
          {submit.isPending ? 'Logging in…' : 'Log in'}
        </Button>
        <p className="text-center text-sm font-medium text-brand">
          Don’t have an account?{' '}
          <Link to={paths.signUp} className="text-primary-text">
            Create account
          </Link>
        </p>
        <p className="text-center text-sm text-ink-3">
          Credit desk invite?{' '}
          <Link to={paths.staffJoin} className="font-medium text-brand">
            Join here
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
