import { useState, type ReactNode } from 'react';
import type { TransactionAuthorisation } from '@/api/types';
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
  const [pin, setPin] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = async (getAuth: () => Promise<TransactionAuthorisation>) => {
    setPending(true);
    setError(null);
    try {
      await onApprove(await getAuth());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setPin('');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="grid gap-3 pb-1">
      <div className="min-w-0 text-center">{summary}</div>
      <p className="text-center text-sm font-medium">
        {pending ? 'Processing…' : 'Enter your 6-digit transaction PIN'}
      </p>
      <PinPad
        length={6}
        value={pin}
        onChange={setPin}
        onComplete={(p) => approve(async () => ({ method: 'pin', pin: p }))}
        disabled={pending}
      />
      {error && (
        <p role="alert" className="mx-auto max-w-full px-1 text-center text-[13px] break-all text-primary-text">
          {friendlyPinError(error)}
        </p>
      )}
    </div>
  );
}

function friendlyPinError(message: string) {
  if (/invalid signature|intrusion detected/i.test(message)) {
    return 'BudPay rejected the payout signature. Try again in a moment.';
  }
  return message;
}
