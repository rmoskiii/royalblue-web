import { CircleCheck, Copy } from 'lucide-react';
import type { SignUpResult } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button } from '@/components/ui';
import { copyText } from '@/lib/clipboard';
import { formatAccountNumber } from '@/lib/format';
import { submitOnEnter, useEnterToSubmit } from '../lib/submitOnEnter';

/** PRD FR-02: the new account number, issued at registration. */
export function DoneStep({
  result,
  onContinue,
  isContinuing,
}: {
  result: SignUpResult;
  onContinue: () => void;
  isContinuing: boolean;
}) {
  const { showToast } = useToast();
  const formRef = useEnterToSubmit();
  return (
    <form
      ref={formRef}
      className="grid gap-4"
      onKeyDown={submitOnEnter}
      onSubmit={(e) => {
        e.preventDefault();
        if (!isContinuing) onContinue();
      }}
    >
      <div className="grid justify-items-center gap-1.5 rounded-tile bg-surface-2 px-4 py-5 text-center">
        <CircleCheck className="mb-1 size-8 text-success" />
        <p className="text-[13px] text-ink-3">Your RoyalBlue account number</p>
        <p className="text-[28px] font-semibold tracking-tight tabular">
          {formatAccountNumber(result.accountNumber)}
        </p>
        <p className="text-[13px] text-ink-2">{result.accountName}</p>
        <button
          type="button"
          className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-text"
          onClick={async () => {
            await copyText(result.accountNumber);
            showToast('Account number copied');
          }}
        >
          <Copy className="size-3.5" /> Copy
        </button>
      </div>
      <p className="text-center text-[13px] text-ink-2">
        You’re on Tier 1. Add an ID later to raise your limits.
      </p>
      <Button type="submit" size="lg" block disabled={isContinuing}>
        {isContinuing ? 'Signing you in…' : 'Go to my account'}
      </Button>
    </form>
  );
}
