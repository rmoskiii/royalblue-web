import { CircleCheck } from 'lucide-react';
import type { TransferResult } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Money } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { shareOrCopy } from '@/lib/clipboard';
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
  const { showToast } = useToast();
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
      <div className="mt-5 grid w-full grid-cols-2 gap-2">
        <Button
          variant="secondary"
          onClick={async () => {
            const resultShare = await shareOrCopy(
              'RoyalBlue transfer',
              `Sent ${formatNaira(draft.amount, 2)} to ${draft.accountName} (${draft.bankName} ${draft.accountNumber}).\nReference ${result.reference}`,
            );
            if (resultShare === 'copied') showToast('Receipt copied');
          }}
        >
          Share receipt
        </Button>
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
