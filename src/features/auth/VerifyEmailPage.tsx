import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { authService } from '@/api/services/auth';
import { useToast } from '@/app/providers/ToastProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths } from '@/components/layout/navigation';
import { Button } from '@/components/ui';
import { CodeInput } from './components/CodeInput';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const email = (useLocation().state as { email?: string } | null)?.email;
  const [code, setCode] = useState('');

  const submit = useMutation({
    mutationFn: () => authService.verifyEmail(email ?? '', code),
    onSuccess: () => navigate(paths.createPassword, { state: { email } }),
  });

  if (!email) return <Navigate to={paths.signUp} replace />;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.length === 6) submit.mutate();
  };

  return (
    <AuthCard
      title="Verify email"
      subtitle={
        <>
          Enter the 6-digit code we sent to <b className="font-medium text-ink">{email}</b>.
        </>
      }
    >
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <CodeInput label="Verification code" value={code} onChange={setCode} />
        {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
        <Button type="submit" size="lg" block disabled={code.length !== 6 || submit.isPending}>
          {submit.isPending ? 'Checking…' : 'Verify'}
        </Button>
        <p className="text-center text-sm text-ink-2">
          Didn’t get it?{' '}
          <button
            type="button"
            className="font-medium text-primary-text hover:underline"
            onClick={() => showToast('We’ve sent a new code')}
          >
            Resend code
          </button>
        </p>
      </form>
    </AuthCard>
  );
}
