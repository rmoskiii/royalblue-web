import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { authService } from '@/api/services/auth';
import type { MfaChallenge } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths, homePathForRole } from '@/components/layout/navigation';
import { Button, TextField } from '@/components/ui';
import { CodeInput } from './components/CodeInput';
import { PasswordField } from './components/PasswordField';
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
  const [totp, setTotp] = useState('');

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
      if ('mfaRequired' in result && result.mfaRequired) {
        setChallenge(result);
        return 'mfa' as const;
      }
      if (!('accessToken' in result)) {
        throw new Error('Authenticator code required');
      }
      goIn(result);
      return 'ok' as const;
    },
  });

  const verify = useMutation({
    mutationFn: () => authService.completeLoginMfa(challenge!.challengeToken, totp),
    onSuccess: (session) => {
      goIn(session);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit.mutate();
  };

  if (challenge) {
    return (
      <AuthCard title="Authenticator code" subtitle="Open Google Authenticator and enter the 6-digit code.">
        <form
          className="grid gap-4"
          onKeyDown={submitOnEnter}
          onSubmit={(e) => {
            e.preventDefault();
            if (totp.length === 6) verify.mutate();
          }}
        >
          <CodeInput label="Authenticator code" value={totp} onChange={setTotp} />
          {verify.isError && <p className="text-[13px] text-primary-text">{verify.error.message}</p>}
          <Button type="submit" size="lg" block disabled={totp.length !== 6 || verify.isPending}>
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
    <AuthCard title="Login to RoyalBlue" subtitle="Use your email or phone number, then your password">
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
          <p className="text-right text-[13px] text-ink-3">
            Keep this password safe. In-app reset is not available yet.
          </p>
        </div>
        {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!identifier.trim() || !password || submit.isPending}>
          {submit.isPending ? 'Logging in…' : 'Login'}
        </Button>
        <p className="text-center text-sm font-medium text-brand">
          Don’t have an account?{' '}
          <Link to={paths.signUp} className="text-primary-text">
            Create Account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
