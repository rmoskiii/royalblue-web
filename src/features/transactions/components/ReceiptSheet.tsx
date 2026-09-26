import type { Transaction } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Chip, Modal, Money } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate, formatNaira, formatTime } from '@/lib/format';
import { TransactionIcon } from './TransactionRow';

export function ReceiptSheet({
  transaction: t,
  onClose,
}: {
  transaction: Transaction | null;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  if (!t) return null;
  const credit = t.direction === 'credit';

  const rows = [
    [credit ? 'From' : 'To', t.counterparty],
    ['Date', `${formatDate(t.createdAt)}, ${formatTime(t.createdAt)}`],
    ['Reference', t.reference],
    ['Fee', t.fee ? formatNaira(t.fee, 2) : 'Free'],
  ];

  return (
    <Modal open onClose={onClose} title="Transaction details">
      <div className="px-5.5 pt-2 pb-5.5 text-center">
        <div className="mx-auto mt-1.5 mb-2.5 w-fit">
          <TransactionIcon credit={credit} large />
        </div>
        <p className="text-ink-3">{t.title}</p>
        <Money
          amount={credit ? t.amount : -t.amount}
          decimals={2}
          signed
          className={cn(
            'my-1.5 block font-display text-[34px] leading-tight font-medium tracking-tight',
            credit && 'text-success',
          )}
        />
        <Chip
          tone={
            t.status === 'successful' ? 'success' : t.status === 'pending' ? 'warning' : 'danger'
          }
        >
          {t.status === 'successful' ? 'Successful' : t.status === 'pending' ? 'Pending' : 'Failed'}
        </Chip>

        <dl className="my-4.5 border-t border-line text-left text-[13px]">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-line py-2.5">
              <dt className="text-ink-3">{k}</dt>
              <dd className="text-right font-medium tabular">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => showToast('Receipt sharing is coming soon')}>
            Share receipt
          </Button>
          <Button variant="secondary" onClick={() => showToast('We’ll connect this to support')}>
            Report an issue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
