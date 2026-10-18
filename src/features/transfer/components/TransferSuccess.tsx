import { CircleCheck } from 'lucide-react';
import type { TransferResult } from '@/api/types';
import { Button, Money } from '@/components/ui';
import { ShareReceiptActions } from '@/features/transactions/components/ShareReceiptActions';
import type { TransferDraft } from '../types';

export function TransferSuccess({
  draft,
  result,
  onDone,
}: {
  draft: TransferDraft;
  result: TransferResult;
  onDone: () => void;
}) {
  return (
    <div className="grid justify-items-center gap-2 pt-4 pb-2 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
        <CircleCheck className="size-8" />
      </span>
      <p className="mt-2 text-ink-3">Transfer successful</p>
      <Money
        amount={draft.amount}
        decimals={2}
        className="text-[32px] font-semibold tracking-tight text-brand"
      />
      <p className="text-sm">
        sent to <b className="font-semibold">{draft.accountName}</b>
      </p>
      <p className="text-xs text-ink-3 tabular">Reference {result.reference}</p>
      <div className="mt-5 w-full">
        <ShareReceiptActions
          receipt={{
            title: 'Transfer',
            type: 'Transfer',
            amount: draft.amount,
            status: 'successful',
            counterparty: `${draft.accountName} · ${draft.bankName} ${draft.accountNumber}`,
            reference: result.reference,
          }}
          secondary={
            <Button block onClick={onDone}>
              Done
            </Button>
          }
        />
      </div>
    </div>
  );
}
