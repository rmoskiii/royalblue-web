import { useMutation } from '@tanstack/react-query';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { authService } from '@/api/services/auth';
import { AuthCard } from '@/components/layout/AuthCard';
import { paths } from '@/components/layout/navigation';
import { Button, TextField } from '@/components/ui';
import { demo } from '@/config/demo';

export function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(
    demo?.signUp ?? { firstName: '', lastName: '', email: '', phone: '' },
  );
  const set = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = useMutation({
    mutationFn: () => authService.signUp({ ...form, phone: `+234${form.phone}` }),
    onSuccess: ({ email }) => navigate(paths.verifyEmail, { state: { email } }),
  });

  const valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    /\S+@\S+\.\S+/.test(form.email) &&
    /^\d{10}$/.test(form.phone);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) submit.mutate();
  };

  return (
    <AuthCard title="Create account" subtitle="It takes about two minutes.">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="First name"
            autoComplete="given-name"
            value={form.firstName}
            onChange={set('firstName')}
          />
          <TextField
            label="Last name"
            autoComplete="family-name"
            value={form.lastName}
            onChange={set('lastName')}
          />
        </div>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@email.com"
          value={form.email}
          onChange={set('email')}
        />
        <TextField
          label="Phone number"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          prefix="+234"
          maxLength={10}
          placeholder="8034564521"
          value={form.phone}
          onChange={(e) =>
            setForm((f) => ({ ...f, phone: e.target.value.replace(/\D/g, '').replace(/^0/, '') }))
          }
          inputClassName="pl-15 tabular"
        />
        {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
        <Button type="submit" size="lg" block disabled={!valid || submit.isPending}>
          {submit.isPending ? 'Creating account…' : 'Continue'}
        </Button>
        <p className="text-center text-sm">
          Already have an account?{' '}
          <Link to={paths.login} className="font-medium text-primary-text hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
