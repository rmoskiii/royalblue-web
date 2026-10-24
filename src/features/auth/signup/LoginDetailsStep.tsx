import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { authService } from '@/api/services/auth';
import type { Session } from '@/api/types';
import { Button, TextField } from '@/components/ui';
import { demo } from '@/config/demo';
import { PasswordChecklist } from '../components/PasswordChecklist';
import { PasswordField } from '../components/PasswordField';
import { passwordIsValid } from '../lib/passwordRules';

export function LoginDetailsStep({
  signUpToken,
  onDone,
}: {
  signUpToken: string;
  onDone: (result: Session, credentials: { email: string; password: string }) => void;
}) {
  const [email, setEmail] = useState(demo?.signUp.email ?? '');
  const [password, setPassword] = useState(demo?.signUp.password ?? '');
  const [confirm, setConfirm] = useState(demo?.signUp.password ?? '');

  const submit = useMutation({
    mutationFn: () => authService.completeSignUp({ signUpToken, email: email.trim(), password }),
    onSuccess: (result) => onDone(result, { email: email.trim(), password }),
  });

  const matches = password === confirm;
  const valid = /\S+@\S+\.\S+/.test(email) && passwordIsValid(password) && matches;

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) submit.mutate();
      }}
    >
      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
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
      {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
      <Button type="submit" size="lg" block disabled={!valid || submit.isPending}>
        {submit.isPending ? 'Opening your account…' : 'Open my account'}
      </Button>
    </form>
  );
}
