import { Share2 } from 'lucide-react';
import type { Transaction } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Chip, Modal, Money } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatDate, formatNaira, formatTime } from '@/lib/format';
import { shareFileOrCopyImage } from '@/lib/clipboard';
import { renderReceiptPng, type ReceiptShareInput } from '../receiptImage';
import { transactionDisplay } from '../transactionDisplay';
import { TransactionIcon } from './TransactionRow';

export function formatReceiptShare(t: {
  title: string;
  amount: number;
  status?: string;
  counterparty?: string;
  reference: string;
  createdAt?: string;
  fee?: number;
}) {
  const when = t.createdAt ? `${formatDate(t.createdAt)}, ${formatTime(t.createdAt)}` : undefined;
  return [
    t.counterparty || t.title,
    t.title && t.title !== t.counterparty ? t.title : undefined,
    formatNaira(t.amount, 2),
    t.status ? t.status[0].toUpperCase() + t.status.slice(1) : undefined,
    when,
    t.fee ? `Fee ${formatNaira(t.fee, 2)}` : undefined,
    `Reference ${t.reference}`,
    'RoyalBlue MFB',
  ]
    .filter(Boolean)
    .join('\n');
}

export async function shareReceipt(t: ReceiptShareInput, showToast: (message: string) => void) {
  const text = formatReceiptShare(t);
  const blob = await renderReceiptPng(t);
  const file = new File([blob], `royalblue-receipt-${t.reference}.png`, { type: 'image/png' });
  const outcome = await shareFileOrCopyImage({
    title: 'RoyalBlue receipt',
    text,
    file,
  });
  if (outcome === 'copied') showToast('Receipt image copied');
  if (outcome === 'shared') showToast('Receipt shared');
  if (outcome === 'emailed') showToast('Opening email');
}

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
  const { name, description, type } = transactionDisplay(t);

  const rows: Array<[string, string]> = [
    [credit ? 'From' : 'To', name],
    ['Type', type],
  ];
  if (description) rows.push(['Description', description]);
  rows.push(
    ['Date', `${formatDate(t.createdAt)}, ${formatTime(t.createdAt)}`],
    ['Reference', t.reference],
    ['Fee', t.fee ? formatNaira(t.fee, 2) : 'Free'],
  );

  return (
    <Modal open onClose={onClose} title="Receipt" placement="sheet">
      <div className="px-4 pt-2 pb-4 text-center">
        <div className="mx-auto mt-1.5 mb-2.5 w-fit">
          <TransactionIcon credit={credit} large />
        </div>
        <p className="text-[17px] font-semibold tracking-tight text-ink">{name}</p>
        <p className="mt-0.5 text-xs text-ink-3">
          {type}
          {description ? ` · ${description}` : ''}
        </p>
        <Money
          amount={credit ? t.amount : -t.amount}
          decimals={2}
          signed
          className={cn(
            'my-1.5 block text-[26px] leading-tight font-semibold tracking-tight sm:text-[32px]',
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
            <div key={k} className="flex justify-between gap-3 border-b border-line py-2.5">
              <dt className="shrink-0 text-ink-3">{k}</dt>
              <dd className="min-w-0 break-all text-right font-medium tabular">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              void shareReceipt(
                {
                  ...t,
                  type,
                  counterparty: name,
                  title: description || type,
                },
                showToast,
              )
            }
          >
            <Share2 className="size-4" />
            Share receipt
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              const subject = encodeURIComponent(`Transaction ${t.reference}`);
              const body = encodeURIComponent(
                `I need help with this RoyalBlue transaction.\n\nReference: ${t.reference}\nAmount: ${formatNaira(t.amount, 2)}\n`,
              );
              window.location.href = `mailto:support@royalblue.ng?subject=${subject}&body=${body}`;
            }}
          >
            Report an issue
          </Button>
        </div>
      </div>
    </Modal>
  );
}
