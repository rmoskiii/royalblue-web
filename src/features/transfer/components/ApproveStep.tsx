import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/hooks';
import { transferService } from '@/api/services/transfers';
import type { TransactionAuthorisation, TransferResult } from '@/api/types';
import { Money, PinApproval } from '@/components/ui';
import { formatAccountNumber } from '@/lib/format';
import type { TransferDraft } from '../types';

/** Security check: 6-digit transaction PIN from onboarding. */
export function ApproveStep({
  draft,
  onSent,
}: {
  draft: TransferDraft;
  onSent: (result: TransferResult) => void;
}) {
  const queryClient = useQueryClient();

  const send = useMutation({
    mutationFn: (authorisation: TransactionAuthorisation) => {
      const { destination, bankCode, bankName, accountNumber, amount, narration } = draft;
      return transferService.send({
        destination,
        bankCode,
        bankName,
        accountNumber,
        amount,
        narration,
        authorisation,
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      onSent(result);
    },
  });

  return (
    <PinApproval
      onApprove={send.mutateAsync}
      summary={
        <>
          <p className="truncate px-1 text-ink-3">Sending to {draft.accountName}</p>
          <Money
            amount={draft.amount + draft.fee}
            decimals={2}
            className="mt-1 block text-[26px] leading-tight font-semibold tracking-tight text-brand sm:text-[32px]"
          />
          <p className="mt-1 truncate text-xs text-ink-3">
            {formatAccountNumber(draft.accountNumber)} · {draft.bankName}
            {draft.fee === 0 ? ' · No fee' : ''}
          </p>
        </>
      }
    />
  );
}
