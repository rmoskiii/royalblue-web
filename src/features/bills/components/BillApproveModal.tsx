import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleCheck, Copy } from 'lucide-react';
import { useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { billService } from '@/api/services/bills';
import type { BillPaymentResult, TransactionAuthorisation } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Modal, Money, PinApproval } from '@/components/ui';
import { copyText } from '@/lib/clipboard';
import type { BillDraft } from '../types';

/** PIN approval, then the receipt (with the meter token for prepaid electricity). */
export function BillApproveModal({ draft, onClose }: { draft: BillDraft; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [result, setResult] = useState<BillPaymentResult | null>(null);

  const pay = useMutation({
    mutationFn: (authorisation: TransactionAuthorisation) =>
      billService.pay({ ...draft.payment, authorisation }),
    onSuccess: (r) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setResult(r);
    },
  });

  return (
    <Modal
      open
      onClose={onClose}
      title={result ? 'Payment successful' : 'Confirm payment'}
      fullScreenOnMobile
    >
      <div className="px-5.5 pt-3 pb-6">
        {!result ? (
          <PinApproval
            onApprove={pay.mutateAsync}
            summary={
              <>
                <p className="text-ink-3">{draft.title}</p>
                <Money
                  amount={draft.payment.amount}
                  decimals={2}
                  className="mt-1 block text-[32px] leading-tight font-semibold tracking-tight text-brand"
                />
                <dl className="mt-3 grid gap-1 text-left text-[13px]">
                  {draft.details.slice(0, -1).map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="text-ink-3">{k}</dt>
                      <dd className="text-right font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            }
          />
        ) : (
          <div className="grid justify-items-center gap-2 pt-2 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-success-soft text-success">
              <CircleCheck className="size-8" />
            </span>
            <p className="mt-2 text-ink-3">{draft.title}</p>
            <Money
              amount={draft.payment.amount}
              decimals={2}
              className="text-[28px] font-semibold tracking-tight text-brand"
            />

            {result.token && (
              <div className="mt-3 grid w-full gap-1 rounded-tile bg-surface-2 p-4">
                <p className="text-xs font-semibold tracking-wider text-ink-3 uppercase">
                  Your token
                </p>
                <p className="text-xl font-semibold tracking-wider tabular">{result.token}</p>
                {result.units !== undefined && (
                  <p className="text-[13px] text-ink-2">About {result.units} kWh</p>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2 justify-self-center"
                  onClick={async () => {
                    await copyText(result.token!.replace(/-/g, ''));
                    showToast('Token copied');
                  }}
                >
                  <Copy className="size-4" /> Copy token
                </Button>
              </div>
            )}

            <p className="mt-1 text-xs text-ink-3 tabular">Reference {result.reference}</p>
            <Button className="mt-4 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
