import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Fingerprint, KeyRound, LockKeyhole, ShieldCheck, Smartphone } from 'lucide-react';
import { useState } from 'react';
import { authService } from '@/api/services/auth';
import { queryKeys } from '@/api/hooks';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, PageHeader, PinPad, TextField } from '@/components/ui';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { CodeInput } from '@/features/auth/components/CodeInput';
import { SettingsBack } from './SettingsBack';

export function SecuritySettingsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { data: security } = useQuery({
    queryKey: queryKeys.security,
    queryFn: authService.getSecurity,
  });
  const [password, setPassword] = useState({ current: '', next: '' });
  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpSetup, setTotpSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.security });

  const savePassword = useMutation({
    mutationFn: () => authService.changePassword(password.current, password.next),
    onSuccess: () => {
      showToast('Password updated');
      setPassword({ current: '', next: '' });
    },
    onError: (error: Error) => showToast(error.message),
  });

  const savePin = useMutation({
    mutationFn: () => authService.setPin(pin, currentPin || undefined),
    onSuccess: () => {
      showToast('PIN updated');
      setPin('');
      setCurrentPin('');
      refresh();
    },
    onError: (error: Error) => showToast(error.message),
  });

  const startTotp = useMutation({
    mutationFn: () => authService.beginTotp(),
    onSuccess: setTotpSetup,
    onError: (error: Error) => showToast(error.message),
  });

  const confirmTotp = useMutation({
    mutationFn: () => authService.confirmTotp(totpCode),
    onSuccess: () => {
      showToast('Google Authenticator is on');
      setTotpSetup(null);
      setTotpCode('');
      refresh();
    },
    onError: (error: Error) => showToast(error.message),
  });

  const disableTotp = useMutation({
    mutationFn: () => authService.disableTotp(totpCode),
    onSuccess: () => {
      showToast('Authenticator turned off');
      setTotpCode('');
      refresh();
    },
    onError: (error: Error) => showToast(error.message),
  });

  if (!security) return null;
  const qr = totpSetup
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(totpSetup.otpauthUrl)}`
    : null;

  return (
    <>
      <SettingsBack />
      <PageHeader
        title="Sign-in and security"
        subtitle="Password, PIN and authenticator — the same controls you’ll get on the RoyalBlue app."
      />
      <div className="mx-auto grid max-w-xl gap-4">
        <Card>
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-text">
              <KeyRound className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Password</h2>
              <p className="text-[13px] text-ink-3">Used on web. The app can also sign in with PIN.</p>
            </div>
          </div>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              savePassword.mutate();
            }}
          >
            <PasswordField
              label="Current password"
              value={password.current}
              onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
            />
            <PasswordField
              label="New password"
              value={password.next}
              onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
            />
            <Button type="submit" disabled={password.next.length < 8 || savePassword.isPending}>
              Update password
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-text">
              <LockKeyhole className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Payment PIN</h2>
              <p className="text-[13px] text-ink-3">
                {security.pinSet ? 'PIN is set. Enter the current PIN to change it.' : 'Set a 6-digit PIN for transfers.'}
              </p>
            </div>
          </div>
          {security.pinSet && (
            <TextField
              label="Current PIN"
              inputMode="numeric"
              maxLength={6}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mb-3"
            />
          )}
          <PinPad length={6} value={pin} onChange={setPin} onComplete={setPin} />
          <Button
            className="mt-4"
            block
            disabled={pin.length !== 6 || savePin.isPending}
            onClick={() => savePin.mutate()}
          >
            {security.pinSet ? 'Change PIN' : 'Save PIN'}
          </Button>
        </Card>

        <Card>
          <div className="mb-3 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary-soft text-primary-text">
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Google Authenticator</h2>
              <p className="text-[13px] text-ink-3">
                {security.totpEnabled
                  ? 'Required after your password on web, and as 2FA on mobile.'
                  : 'Add a second factor so a stolen password is not enough.'}
              </p>
            </div>
          </div>
          {qr && (
            <div className="mb-3 grid justify-items-center gap-2 rounded-[16px] bg-surface-2 p-4">
              <img src={qr} alt="" className="size-40 rounded-xl bg-white p-2" />
              <p className="font-mono text-[13px] break-all">{totpSetup?.secret}</p>
            </div>
          )}
          {(totpSetup || security.totpEnabled) && (
            <div className="mb-3">
              <CodeInput label="Authenticator code" value={totpCode} onChange={setTotpCode} />
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {!security.totpEnabled && !totpSetup && (
              <Button onClick={() => startTotp.mutate()} disabled={startTotp.isPending}>
                Set up authenticator
              </Button>
            )}
            {totpSetup && (
              <Button onClick={() => confirmTotp.mutate()} disabled={totpCode.length !== 6}>
                Confirm
              </Button>
            )}
            {security.totpEnabled && (
              <Button variant="secondary" onClick={() => disableTotp.mutate()} disabled={totpCode.length !== 6}>
                Turn off
              </Button>
            )}
          </div>
        </Card>

        <Card className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-brand">
            <Fingerprint className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Face ID / fingerprint</h2>
            <p className="text-[13px] text-ink-3">
              Available on the iOS and Android apps. This browser cannot store biometrics.
            </p>
          </div>
        </Card>

        <Card className="flex items-start gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-brand">
            <Smartphone className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">This device</h2>
            <p className="text-[13px] text-ink-3">
              Web session. Trusted-device lists and remote logout ship with the mobile build.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
