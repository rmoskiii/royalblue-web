import { useEffect, useState, type FormEvent } from 'react';
import { authService } from '@/api/services/auth';
import { Button, TextField } from '@/components/ui';
import { normalizeNgPhone } from '@/lib/ng-phone';
import { submitOnEnter } from '../lib/submitOnEnter';

export function PersonDetailsStep({
  email,
  otp,
  onDone,
}: {
  email: string;
  otp?: string;
  onDone: (details: { firstName: string; lastName: string; phone: string }) => void;
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string>();
  const [phoneChecking, setPhoneChecking] = useState(false);
  const canonicalPhone = normalizeNgPhone(phone);

  useEffect(() => {
    if (!canonicalPhone) {
      setPhoneError(undefined);
      setPhoneChecking(false);
      return;
    }
    let cancelled = false;
    setPhoneChecking(true);
    void authService
      .checkPhoneAvailable(canonicalPhone, email, otp)
      .then(() => {
        if (!cancelled) setPhoneError(undefined);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setPhoneError(error instanceof Error ? error.message : 'This phone number is already in use.');
        }
      })
      .finally(() => {
        if (!cancelled) setPhoneChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [canonicalPhone, email, otp]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canonicalPhone || phoneError || phoneChecking) return;
    onDone({ firstName: firstName.trim(), lastName: lastName.trim(), phone: canonicalPhone });
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
        error={phoneError}
        hint={
          phoneChecking
            ? 'Checking this number…'
            : canonicalPhone
              ? undefined
              : 'Use the 11-digit number linked to your BVN, starting with 0.'
        }
      />
      <Button
        type="submit"
        size="lg"
        block
        disabled={
          !firstName.trim() ||
          !lastName.trim() ||
          !canonicalPhone ||
          Boolean(phoneError) ||
          phoneChecking
        }
      >
        Continue
      </Button>
    </form>
  );
}
