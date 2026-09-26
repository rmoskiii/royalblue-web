import { Copy } from 'lucide-react';
import { useAccount } from '@/api/hooks';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Modal } from '@/components/ui';
import { copyText } from '@/lib/clipboard';
import { formatAccountNumber } from '@/lib/format';

/** Figma: "Start receiving money from anywhere." */
export function AddMoneySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: account } = useAccount();
  const { showToast } = useToast();
  if (!account) return null;

  const copyDetails = async () => {
    await copyText(`${account.accountName}\n${account.bankName}\n${account.accountNumber}`);
    showToast('Account details copied');
  };

  const rows = [
    ['Bank', account.bankName],
    ['Account name', account.accountName],
    ['Account number', formatAccountNumber(account.accountNumber)],
  ];

  return (
    <Modal open={open} onClose={onClose} title="Add money">
      <div className="px-5.5 pt-2 pb-5.5">
        <h3 className="font-display text-[28px] leading-tight font-medium tracking-tight text-brand">
          Receive money from any bank
        </h3>
        <p className="mt-1 text-ink-3">Transfers to this account arrive instantly.</p>
        <dl className="my-4.5 border-t border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5">
              <dt className="text-[13px] text-ink-3">{k}</dt>
              <dd className="text-right font-medium tabular">{v}</dd>
            </div>
          ))}
        </dl>
        <Button block size="lg" onClick={copyDetails}>
          <Copy className="size-4" /> Copy account details
        </Button>
      </div>
    </Modal>
  );
}
