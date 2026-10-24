import { useMutation } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '@/api/services/auth';
import { useAuth } from '@/app/providers/AuthProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths } from '@/components/layout/navigation';
import { Button } from '@/components/ui';
import { env } from '@/config/env';
import { useToast } from '@/app/providers/ToastProvider';
import { CodeInput } from './components/CodeInput';
import { PasswordChecklist } from './components/PasswordChecklist';
import { PasswordField } from './components/PasswordField';
import { passwordIsValid } from './lib/passwordRules';
import { submitOnEnter } from './lib/submitOnEnter';

export function ForcePasswordPage() {
  const { logout, session } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const sent = useRef(false);

  const sendOtp = useMutation({
    mutationFn: () => authService.requestPasswordChangeOtp(),
    onSuccess: (result) => {
      if (env.useMocks && result.otp) setOtp(result.otp);
      showToast(result.message);
    },
  });

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    sendOtp.mutate();
  }, [sendOtp]);

  const save = useMutation({
    mutationFn: () => authService.changePassword(current, next, otp),
    onSuccess: (result) => {
      showToast(result.message);
      logout();
      navigate(paths.login, { replace: true });
    },
  });

  const matches = next === confirm;
  const valid = passwordIsValid(next) && matches && current.length > 0 && otp.length === 6;

  return (
    <AuthCard
      title="Update your password"
      subtitle={`RoyalBlue now requires a stronger password before ${session?.user.email ?? 'this account'} can open Home or the credit desk.`}
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
          label="Current password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
        />
        <PasswordField
          label="New password"
          autoComplete="new-password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
        />
        <PasswordChecklist value={next} />
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm && !matches ? 'Passwords don’t match.' : undefined}
        />
        <CodeInput label="Email code" value={otp} onChange={setOtp} />
        <button
          type="button"
          className="justify-self-start text-sm font-medium text-brand"
          onClick={() => sendOtp.mutate()}
        >
          {sendOtp.isPending ? 'Sending…' : 'Send a new code'}
        </button>
        {save.isError && <p className="text-[13px] text-primary-text">{save.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!valid || save.isPending}>
          {save.isPending ? 'Saving…' : 'Save password'}
        </Button>
      </form>
    </AuthCard>
  );
}
