import { useMutation } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { authService } from '@/api/services/auth';
import { useToast } from '@/app/providers/ToastProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths } from '@/components/layout/navigation';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';
import { PasswordField } from './components/PasswordField';

// TODO(api): align with the backend password policy.
const rules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'An uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A number', test: (p: string) => /\d/.test(p) },
  { label: 'A symbol', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export function CreatePasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const email = (useLocation().state as { email?: string } | null)?.email;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const submit = useMutation({
    mutationFn: () => authService.createPassword(email ?? '', password),
    onSuccess: () => {
      showToast('Password created. Log in to continue.');
      navigate(paths.login, { replace: true });
    },
  });

  if (!email) return <Navigate to={paths.signUp} replace />;

  const allRulesPass = rules.every((r) => r.test(password));
  const matches = password === confirm;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (allRulesPass && matches) submit.mutate();
  };

  return (
    <AuthCard title="Create password" subtitle="You’ll use this to log in.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <PasswordField
          label="Password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <ul className="grid gap-1.5 text-[13px]">
          {rules.map((r) => {
            const ok = r.test(password);
            return (
              <li
                key={r.label}
                className={cn('flex items-center gap-2', ok ? 'text-success' : 'text-ink-3')}
              >
                <Check className="size-3.5" />
                {r.label}
              </li>
            );
          })}
        </ul>
        <PasswordField
          label="Confirm password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={confirm && !matches ? 'Passwords don’t match.' : undefined}
        />
        {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
        <Button
          type="submit"
          size="lg"
          block
          disabled={!allRulesPass || !matches || submit.isPending}
        >
          {submit.isPending ? 'Saving…' : 'Create password'}
        </Button>
      </form>
    </AuthCard>
  );
}
