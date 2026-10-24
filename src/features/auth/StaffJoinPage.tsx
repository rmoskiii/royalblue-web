import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { authService } from '@/api/services/auth';
import type { MfaChallenge } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { homePathForRole, paths } from '@/components/layout/navigation';
import { Button, TextField } from '@/components/ui';
import { CodeInput } from './components/CodeInput';
import { PasswordChecklist } from './components/PasswordChecklist';
import { PasswordField } from './components/PasswordField';
import { passwordIsValid } from './lib/passwordRules';
import { submitOnEnter } from './lib/submitOnEnter';

type Step = 'email' | 'details';

export function StaffJoinPage() {
  const { establishSession } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(params.get('email')?.trim() ?? '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null);
  const [totp, setTotp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

  const goIn = (session: { user: { role?: string } }) => {
    establishSession(session as Parameters<typeof establishSession>[0]);
    navigate(homePathForRole(session.user.role), { replace: true });
  };

  const start = useMutation({
    mutationFn: () => authService.requestStaffJoinOtp(email.trim().toLowerCase()),
    onSuccess: (result) => {
      setOtp(result.otp ?? '');
      setStep('details');
    },
  });

  const finish = useMutation({
    mutationFn: () => authService.completeStaffJoin(email.trim().toLowerCase(), otp, password),
    onSuccess: (result) => {
      if ('mfaRequired' in result && result.mfaRequired) {
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
    onSuccess: goIn,
  });

  if (challenge) {
    const totpOnly = challenge.methods.includes('totp');
    const ready = totpOnly ? totp.length === 6 : emailOtp.length === 6;
    return (
      <AuthCard
        title={totpOnly ? 'Authenticator code' : 'Check your email'}
        subtitle={
          totpOnly
            ? 'Open Google Authenticator and enter the 6-digit code.'
            : `We emailed a 6-digit code to ${challenge.email}.`
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
          {verify.isError && <p className="text-[13px] text-primary-text">{verify.error.message}</p>}
          <Button type="submit" size="lg" block disabled={!ready || verify.isPending}>
            {verify.isPending ? 'Checking…' : 'Verify'}
          </Button>
        </form>
      </AuthCard>
    );
  }

  if (step === 'details') {
    const matches = password === confirm;
    const valid = otp.length === 6 && passwordIsValid(password) && matches;
    return (
      <AuthCard
        title="Finish desk access"
        subtitle="No BVN or NIN — this login is so freeze, recommend, and decide are tied to you."
      >
        <form
          className="grid gap-4"
          onKeyDown={submitOnEnter}
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) finish.mutate();
          }}
        >
          <CodeInput label="Email code" value={otp} onChange={setOtp} />
          <PasswordField
            label="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordChecklist value={password} />
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirm && !matches ? 'Passwords don’t match.' : undefined}
          />
          {finish.isError && <p className="text-[13px] text-primary-text">{finish.error.message}</p>}
          <Button type="submit" size="lg" block disabled={!valid || finish.isPending}>
            {finish.isPending ? 'Opening desk…' : 'Join the credit desk'}
          </Button>
        </form>
      </AuthCard>
    );
  }

  const handleStart = (e: FormEvent) => {
    e.preventDefault();
    start.mutate();
  };

  return (
    <AuthCard
      title="Join the credit desk"
      subtitle="Use the work email an administrator invited. This is not a customer account."
    >
      <form className="grid gap-4" onKeyDown={submitOnEnter} onSubmit={handleStart}>
        <TextField
          label="Work email"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {start.isError && <p className="text-[13px] text-primary-text">{start.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!email.trim() || start.isPending}>
          {start.isPending ? 'Sending…' : 'Email me a code'}
        </Button>
        <p className="text-center text-sm text-ink-3">
          Already have a desk login?{' '}
          <Link to={paths.login} className="font-medium text-brand">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
