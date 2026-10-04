import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router';
import { authService } from '@/api/services/auth';
import { paths } from '@/components/layout/navigation';
import { Button, TextField } from '@/components/ui';
import { demo } from '@/config/demo';
import { submitOnEnter } from '../lib/submitOnEnter';

export function PhoneStep({ onDone }: { onDone: (phone: string) => void }) {
  const [phone, setPhone] = useState(demo?.signUp.phone ?? '');
  const fullPhone = `+234${phone}`;
  const submit = useMutation({
    mutationFn: () => authService.startSignUp(fullPhone),
    onSuccess: () => onDone(fullPhone),
  });

  return (
    <form
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        submit.mutate();
      }}
    >
      <TextField
        label="Phone number"
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        prefix="+234"
        maxLength={10}
        placeholder="8034564521"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').replace(/^0/, ''))}
        inputClassName="pl-15 tabular"
        hint="We’ll text you a 6-digit code."
        error={submit.isError ? submit.error.message : undefined}
      />
      <Button type="submit" size="lg" block disabled={!/^\d{10}$/.test(phone) || submit.isPending}>
        {submit.isPending ? 'Sending code…' : 'Continue'}
      </Button>
      <p className="text-center text-sm">
        Already have an account?{' '}
        <Link to={paths.login} className="font-medium text-primary-text hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
