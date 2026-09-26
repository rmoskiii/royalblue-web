import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { queryKeys } from '@/api/hooks';
import { transferService } from '@/api/services/transfers';
import type { TransferDestination } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Modal, TextField } from '@/components/ui';
import { formatAccountNumber, formatNaira } from '@/lib/format';

export interface TransferDraft {
  destination: TransferDestination;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  fee: number;
  narration?: string;
}

export function ConfirmTransferSheet({
  draft,
  onClose,
  onSent,
}: {
  draft: TransferDraft | null;
  onClose: () => void;
  onSent: () => void;
}) {
  const [pin, setPin] = useState('');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const send = useMutation({
    mutationFn: transferService.send,
    onSuccess: () => {
      if (!draft) return;
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      showToast(`${formatNaira(draft.amount)} sent to ${draft.accountName}`);
      setPin('');
      onSent();
    },
  });

  if (!draft) return null;

  const rows = [
    ['To', draft.accountName],
    ['Account', `${formatAccountNumber(draft.accountNumber)} · ${draft.bankName}`],
    ['Amount', formatNaira(draft.amount, 2)],
    ['Fee', draft.fee ? formatNaira(draft.fee, 2) : 'Free'],
    ...(draft.narration ? [['Description', draft.narration]] : []),
  ];

  return (
    <Modal open onClose={onClose} title="Confirm transfer">
      <form
        className="px-5.5 pt-2 pb-5.5"
        onSubmit={(e) => {
          e.preventDefault();
          const { destination, bankCode, accountNumber, amount, narration } = draft;
          send.mutate({ destination, bankCode, accountNumber, amount, narration, pin });
        }}
      >
        <p className="text-ink-3">You’re sending</p>
        <p className="font-display text-[34px] leading-tight font-medium tracking-tight text-brand tabular">
          <span className="font-sans">₦</span>
          {formatNaira(draft.amount + draft.fee, 2).slice(1)}
        </p>
        <dl className="my-4 border-t border-line text-[13px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5">
              <dt className="text-ink-3">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <TextField
          label="Transaction PIN"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          placeholder="4-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          error={send.isError ? send.error.message : undefined}
          inputClassName="tracking-[0.4em]"
        />
        <Button
          type="submit"
          block
          size="lg"
          className="mt-4"
          disabled={pin.length !== 4 || send.isPending}
        >
          {send.isPending ? 'Sending…' : 'Send money'}
        </Button>
      </form>
    </Modal>
  );
}
