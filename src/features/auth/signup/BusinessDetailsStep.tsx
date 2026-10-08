import { useState, type FormEvent } from 'react';
import { Button, TextField } from '@/components/ui';
import { submitOnEnter } from '../lib/submitOnEnter';

export function PersonDetailsStep({
  onDone,
}: {
  onDone: (details: { firstName: string; lastName: string; phone: string }) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onDone({ firstName: firstName.trim(), lastName: lastName.trim(), phone: phone.trim() });
  };

  return (
    <form className="grid gap-4" onKeyDown={submitOnEnter} onSubmit={handleSubmit}>
      <TextField
        label="First name"
        autoComplete="given-name"
        autoFocus
        required
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <TextField
        label="Last name"
        autoComplete="family-name"
        required
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <TextField
        label="Phone"
        type="tel"
        autoComplete="tel"
        inputMode="numeric"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <Button type="submit" size="lg" block disabled={!firstName.trim() || !lastName.trim() || phone.replace(/\D/g, '').length < 10}>
        Continue
      </Button>
    </form>
  );
}
