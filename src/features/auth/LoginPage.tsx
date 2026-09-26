import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths } from '@/components/layout/navigation';
import { Button, TextField } from '@/components/ui';
import { PasswordField } from './components/PasswordField';
import { demo } from '@/config/demo';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from ?? paths.home;

  const [email, setEmail] = useState(demo?.login.email ?? '');
  const [password, setPassword] = useState(demo?.login.password ?? '');

  const submit = useMutation({
    mutationFn: () => login(email.trim(), password),
    onSuccess: () => navigate(redirectTo, { replace: true }),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit.mutate();
  };

  return (
    <AuthCard title="Login to RoyalBlue" subtitle="Use the email you registered with.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="grid gap-1.5">
          <PasswordField
            label="Password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="justify-self-end text-sm font-medium text-brand hover:underline"
            onClick={() => showToast('Password reset is coming soon')}
          >
            Forgot password?
          </button>
        </div>
        {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!email || !password || submit.isPending}>
          {submit.isPending ? 'Logging in…' : 'Login'}
        </Button>
        <p className="text-center text-sm">
          Don’t have an account?{' '}
          <Link to={paths.signUp} className="font-medium text-primary-text hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
