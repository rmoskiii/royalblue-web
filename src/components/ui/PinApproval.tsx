import { useState, type ReactNode } from 'react';
import type { TransactionAuthorisation } from '@/api/types';
import { approveWithPasskey } from '@/lib/passkey';
import { PinPad } from './PinPad';

/**
 * Security check for any money movement (PRD FR-08): a 4-digit PIN pad with a
 * passkey/biometric option. Shared by transfers and bill payments.
 *
 * `onApprove` should return the request promise (e.g. a mutation's mutateAsync);
 * errors are shown here and the PIN is cleared so the customer can retry.
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
    <div className="grid gap-6 pb-2">
      <div className="text-center">{summary}</div>
      <p className="text-center text-sm font-medium">
        {pending ? 'Processing…' : 'Enter your 4-digit transaction PIN'}
      </p>
      <PinPad
        value={pin}
        onChange={setPin}
        onComplete={(p) => approve(async () => ({ method: 'pin', pin: p }))}
        onBiometric={() =>
          approve(async () => ({ method: 'passkey', assertion: await approveWithPasskey() }))
        }
        disabled={pending}
      />
      {error && (
        <p role="alert" className="text-center text-[13px] text-primary-text">
          {error}
        </p>
      )}
    </div>
  );
}
