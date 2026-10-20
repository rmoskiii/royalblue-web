import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Fingerprint, KeyRound, LockKeyhole, ShieldCheck, Smartphone } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { authService } from '@/api/services/auth';
import { queryKeys } from '@/api/hooks';
import { useAuth } from '@/app/providers/AuthProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { env } from '@/config/env';
import { Button, Card, PageHeader, PinPad, SectionLoader, TextField } from '@/components/ui';
import { paths } from '@/components/layout/navigation';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { CodeInput } from '@/features/auth/components/CodeInput';
import { SettingsBack } from './SettingsBack';

export function SecuritySettingsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const pinLock = params.get('pinLock') === '1';
  const { data: security } = useQuery({
    queryKey: queryKeys.security,
    queryFn: authService.getSecurity,
  });
  const [password, setPassword] = useState({ current: '', next: '' });
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpSetup, setTotpSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.security });

  const sendPasswordOtp = useMutation({
    mutationFn: () => authService.requestPasswordChangeOtp(),
    onSuccess: (result) => {
      showToast(env.useMocks && result.otp ? `Code ${result.otp}` : result.message);
    },
    onError: (error: Error) => showToast(error.message),
  });

  const savePassword = useMutation({
    mutationFn: () =>
      authService.changePassword(
        password.current,
        password.next,
        otp,
        security?.totpEnabled ? totpCode : undefined,
      ),
    onSuccess: () => {
      showToast('Password updated. Sign in again.');
      setPassword({ current: '', next: '' });
      setOtp('');
      logout();
      navigate(paths.login, { replace: true });
    },
    onError: (error: Error) => showToast(error.message),
  });

  const otpSent = useRef(false);
  useEffect(() => {
    if (!pinLock || otpSent.current) return;
    otpSent.current = true;
    sendPasswordOtp.mutate();
  }, [pinLock, sendPasswordOtp]);

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

  if (!security) return <SectionLoader label="Loading security settings" />;
  const pinBlocked = Boolean(security.pinLocked || pinLock);
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
              <p className="text-[13px] text-ink-3">
                {pinLock
                  ? 'PIN is locked. We email a code, then you set a new password and sign in again.'
                  : 'A 6-digit email code is required. If Authenticator is on, enter that too.'}
              </p>
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
            <CodeInput label="Email code" value={otp} onChange={setOtp} />
            {security.totpEnabled && (
              <CodeInput label="Authenticator code" value={totpCode} onChange={setTotpCode} />
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={sendPasswordOtp.isPending}
                onClick={() => sendPasswordOtp.mutate()}
              >
                {sendPasswordOtp.isPending ? 'Sending…' : 'Email a code'}
              </Button>
              <Button
                type="submit"
                disabled={
                  password.next.length < 8 ||
                  otp.length !== 6 ||
                  (security.totpEnabled && totpCode.length !== 6) ||
                  savePassword.isPending
                }
              >
                {savePassword.isPending ? 'Updating…' : 'Update password'}
              </Button>
            </div>
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
                {pinBlocked
                  ? 'PIN is locked. Change your password with an email code to unlock sends. You cannot change the PIN while it is locked.'
                  : security.pinSet
                    ? 'PIN is set. Enter the current PIN to change it.'
                    : 'Set a 6-digit PIN for transfers.'}
              </p>
            </div>
          </div>
          {!pinBlocked && security.pinSet && (
            <TextField
              label="Current PIN"
              inputMode="numeric"
              maxLength={6}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="mb-3"
            />
          )}
          {!pinBlocked && (
            <>
              <PinPad length={6} value={pin} onChange={setPin} onComplete={setPin} />
              <Button
                className="mt-4"
                block
                disabled={pin.length !== 6 || savePin.isPending}
                onClick={() => savePin.mutate()}
              >
                {security.pinSet ? 'Change PIN' : 'Save PIN'}
              </Button>
            </>
          )}
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
                  ? 'Required after your password on this browser. Turn it off here if you want.'
                  : 'Optional. Add an authenticator so a stolen password is not enough to sign in.'}
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
