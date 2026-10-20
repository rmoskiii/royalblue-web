import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { ApiError } from '@/api/client';
import type { TransactionAuthorisation } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { paths } from '@/components/layout/navigation';
import { Button } from './Button';
import { Modal } from './Modal';
import { PinPad } from './PinPad';

/**
 * Security check for any money movement: the 6-digit transaction PIN from sign-up.
 */
export function PinApproval({
  summary,
  onApprove,
}: {
  /** What's being approved: amount, recipient, fee… */
  summary: ReactNode;
  onApprove: (authorisation: TransactionAuthorisation) => Promise<unknown>;
}) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);

  const approve = async (getAuth: () => Promise<TransactionAuthorisation>) => {
    if (locked) return;
    setPending(true);
    setError(null);
    try {
      await onApprove(await getAuth());
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Try again.';
      if (isPinLocked(e)) {
        setLocked(true);
      } else {
        setError(friendlyPinError(message));
      }
      setPin('');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-3 pb-1 max-lg:flex-1 max-lg:content-center max-lg:gap-8 max-lg:px-2 max-lg:pb-4">
      <div className="min-w-0 text-center">{summary}</div>
      <p className="text-center text-sm font-medium max-lg:text-base">
        {pending ? 'Processing…' : locked ? 'PIN locked' : 'Enter your 6-digit transaction PIN'}
      </p>
      <PinPad
        length={6}
        largeOnMobile
        value={pin}
        onChange={setPin}
        onComplete={(p) => approve(async () => ({ method: 'pin', pin: p }))}
        disabled={pending || locked}
      />
      {error && (
        <p role="alert" className="mx-auto max-w-full px-1 text-center text-[13px] break-all text-primary-text">
          {error}
        </p>
      )}
      <Modal
        open={locked}
        onClose={() => setLocked(false)}
        title="Sends locked for this session"
      >
        <p className="text-[13px] text-ink-2">
          The transaction PIN was entered incorrectly 3 times. Sends stay locked until you prove
          this is you: we email a 6-digit code, you set a new password, then sign in again.
        </p>
        <div className="mt-4 grid gap-2">
          <Button
            block
            onClick={() => navigate(`${paths.settingsSecurity}?pinLock=1`)}
          >
            Change password (email code)
          </Button>
          <Button
            variant="secondary"
            block
            onClick={() => {
              logout();
              navigate(paths.forgot);
            }}
          >
            I forgot my password
          </Button>
          <Button variant="ghost" block onClick={() => setLocked(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function isPinLocked(error: unknown) {
  if (error instanceof ApiError && error.status === 423) return true;
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /pin locked|3 incorrect tries|unlock sends/i.test(message);
}

function friendlyPinError(message: string) {
  if (/invalid signature|intrusion detected/i.test(message)) {
    return /airtime|bill|electricity|data|TV payment/i.test(message)
      ? 'The payment network rejected this bill payment. Try again in a moment.'
      : 'The payment network rejected this transfer. Try again in a moment.';
  }
  return message;
}
