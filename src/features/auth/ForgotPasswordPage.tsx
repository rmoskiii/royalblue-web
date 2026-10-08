import { useMutation } from '@tanstack/react-query';
import { Check, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { authService } from '@/api/services/auth';
import { useToast } from '@/app/providers/ToastProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths } from '@/components/layout/navigation';
import { Button, TextField } from '@/components/ui';
import { cn } from '@/lib/cn';
import { CodeInput } from './components/CodeInput';
import { PasswordField } from './components/PasswordField';
import { passwordIsValid, passwordRules } from './lib/passwordRules';
import { submitOnEnter } from './lib/submitOnEnter';

type Step = 'email' | 'code' | 'password';

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1 rounded-[10px] bg-surface-2 px-2 text-sm text-ink-2"
    >
      <ChevronLeft className="size-4" />
      Back
    </button>
  );
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const start = useMutation({
    mutationFn: () => authService.requestPasswordReset(email.trim().toLowerCase()),
    onSuccess: (result) => {
      setCode(result.otp ?? '');
      setStep('code');
    },
  });

  const resend = useMutation({
    mutationFn: () => authService.requestPasswordReset(email.trim().toLowerCase()),
    onSuccess: (result) => {
      if (result.otp) setCode(result.otp);
      showToast('We’ve sent a new code');
    },
  });

  const save = useMutation({
    mutationFn: () => authService.resetPassword(email.trim().toLowerCase(), code, password),
    onSuccess: (result) => {
      showToast(result.message);
      navigate(paths.login, { replace: true });
    },
  });

  if (step === 'code') {
    return (
      <AuthCard
        title="Check your email"
        subtitle="We’ve sent a 6-digit code if that address is on an account."
        back={<BackButton onClick={() => setStep('email')} />}
      >
        <form
          className="grid gap-4"
          onKeyDown={submitOnEnter}
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 6) setStep('password');
          }}
        >
          <CodeInput label="Email code" value={code} onChange={setCode} />
          <button
            type="button"
            className="justify-self-start text-sm font-medium text-brand"
            onClick={() => resend.mutate()}
          >
            {resend.isPending ? 'Sending…' : 'Resend code'}
          </button>
          <Button type="submit" size="lg" block disabled={code.length !== 6}>
            Continue
          </Button>
        </form>
      </AuthCard>
    );
  }

  if (step === 'password') {
    const matches = password === confirm;
    const valid = passwordIsValid(password) && matches;
    return (
      <AuthCard
        title="New password"
        subtitle="Choose a password you have not used on this account."
        back={<BackButton onClick={() => setStep('code')} />}
      >
        <form
          className="grid gap-4"
          onKeyDown={submitOnEnter}
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) save.mutate();
          }}
        >
          <PasswordField
            label="New password"
            autoComplete="new-password"
            autoFocus
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ul className="grid grid-cols-2 gap-1.5 text-[13px]">
            {passwordRules.map((rule) => {
              const ok = rule.test(password);
              return (
                <li
                  key={rule.label}
                  className={cn('flex items-center gap-1.5', ok ? 'text-success' : 'text-ink-3')}
                >
                  <Check className="size-3.5 shrink-0" />
                  {rule.label}
                </li>
              );
            })}
          </ul>
          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirm && !matches ? 'Passwords don’t match.' : undefined}
          />
          {save.isError && <p className="text-[13px] text-primary-text">{save.error.message}</p>}
          <Button type="submit" size="lg" block disabled={!valid || save.isPending}>
            {save.isPending ? 'Saving…' : 'Update password'}
          </Button>
        </form>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot password"
      subtitle="We’ll send a code to the email on your account."
    >
      <form
        className="grid gap-4"
        onKeyDown={submitOnEnter}
        onSubmit={(e) => {
          e.preventDefault();
          if (email.includes('@')) start.mutate();
        }}
      >
        <TextField
          label="Email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {start.isError && <p className="text-[13px] text-primary-text">{start.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!email.includes('@') || start.isPending}>
          {start.isPending ? 'Sending…' : 'Send code'}
        </Button>
        <p className="text-center text-sm font-medium text-brand">
          Remembered it?{' '}
          <Link to={paths.login} className="text-primary-text">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
