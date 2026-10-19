import { Copy, Link2, Share2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAccount } from '@/api/hooks';
import { accountService } from '@/api/services/accounts';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Modal, TextField } from '@/components/ui';
import { copyText } from '@/lib/clipboard';
import { parseAmount } from '@/lib/format';

export function PaymentLinkSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: account } = useAccount();
  const { showToast } = useToast();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const naira = parseAmount(amount);

  const close = useCallback(() => {
    setAmount('');
    setDescription('');
    setLink(null);
    onClose();
  }, [onClose]);

  const create = useMutation({
    mutationFn: () => accountService.createPaymentLink(naira, description || undefined),
    onSuccess: (result) => setLink(result.paymentLink),
    onError: (error: Error) => showToast(error.message),
  });

  const copy = async () => {
    if (!link) return;
    await copyText(link);
    showToast('Payment link copied');
  };

  const share = async () => {
    if (!link) return;
    try {
      await navigator.share({ title: 'RoyalBlue payment', url: link, text: link });
    } catch {
      await copy();
    }
  };

  return (
    <Modal open={open} onClose={close} title="Payment link">
      <div className="grid gap-4 px-4 pt-2 pb-4">
        {link ? (
          <>
            <p className="text-sm text-ink-2">Share this BudPay link. Anyone can pay you ₦{naira.toLocaleString('en-NG')}.</p>
            <p className="break-all rounded-tile bg-surface-2 px-3 py-2.5 text-[13px]">{link}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void copy()}>
                <Copy className="size-4" /> Copy link
              </Button>
              <Button variant="secondary" onClick={() => void share()}>
                <Share2 className="size-4" /> Share
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-ink-2">
              Create a one-time BudPay payment link. Payers open it and settle to you.
            </p>
            <TextField
              label="Amount"
              prefix="₦"
              inputMode="numeric"
              placeholder="5,000"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d,]/g, ''))}
              hint={account?.accountNumber ? `Paid into ${account.accountName}` : undefined}
            />
            <TextField
              label="What is this for? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Invoice, rent, transfer…"
            />
            <Button
              disabled={naira < 100 || create.isPending}
              onClick={() => create.mutate()}
            >
              <Link2 className="size-4" />
              {create.isPending ? 'Creating link…' : 'Create payment link'}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
