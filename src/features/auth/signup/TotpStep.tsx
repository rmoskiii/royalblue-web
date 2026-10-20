import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { authService } from '@/api/services/auth';
import { Button, TotpQr } from '@/components/ui';
import { CodeInput } from '../components/CodeInput';
import { submitOnEnter } from '../lib/submitOnEnter';

export function TotpStep({
  email,
  otp,
  onDone,
}: {
  email: string;
  otp: string;
  onDone: (totpCode: string) => void;
}) {
  const [code, setCode] = useState('');
  const setup = useMutation({
    mutationFn: () => authService.beginSignupMfa(email, otp),
  });

  useEffect(() => {
    setup.mutate();
    // Enroll once when this step mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const secret = setup.data?.secret;
  const otpauth = setup.data?.otpauthUrl;

  return (
    <form
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        if (code.length === 6) onDone(code);
      }}
    >
      <p className="text-sm text-ink-3">
        Scan this with Google Authenticator, Authy, or 1Password. You’ll need the 6-digit code every
        time you log in on a new browser.
      </p>
      {otpauth && (
        <div className="grid justify-items-center gap-2 rounded-[18px] bg-surface-2 p-4">
          <TotpQr otpauthUrl={otpauth} size={200} />
          {secret && (
            <p className="max-w-full text-center font-mono text-[13px] break-all text-ink-2">
              {secret.replace(/(.{4})/g, '$1 ').trim()}
            </p>
          )}
        </div>
      )}
      {setup.isError && <p className="text-[13px] text-primary-text">{setup.error.message}</p>}
      <CodeInput label="Authenticator code" value={code} onChange={setCode} />
      <Button type="submit" size="lg" block disabled={code.length !== 6 || setup.isPending}>
        Verify and continue
      </Button>
    </form>
  );
}
