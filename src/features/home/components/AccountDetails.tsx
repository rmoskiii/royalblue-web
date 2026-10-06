import { Copy, Share2 } from 'lucide-react';
import { useAccount } from '@/api/hooks';
import { useToast } from '@/app/providers/ToastProvider';
import { Button } from '@/components/ui';
import { copyText } from '@/lib/clipboard';
import { formatAccountNumber } from '@/lib/format';

/** Bank, name and account number with copy and share. Used by Receive and Add money. */
export function AccountDetails() {
  const { data: account } = useAccount();
  const { showToast } = useToast();
  if (!account?.accountNumber) {
    return (
      <p className="mt-4 text-[13px] text-ink-2">
        BudPay is still issuing your dedicated account number. Stay on this page — it will appear
        here when the virtual account is ready.
      </p>
    );
  }

  const text = `${account.accountName}\n${account.bankName}\n${account.accountNumber}`;
  const copy = async () => {
    await copyText(text);
    showToast('Account details copied');
  };
  const share = async () => {
    try {
      await navigator.share({ title: 'My RoyalBlue account', text });
    } catch {
      /* cancelled or unsupported */
    }
  };

  const rows = [
    ['Bank', account.bankName],
    ['Account name', account.accountName],
    ['Account number', formatAccountNumber(account.accountNumber)],
  ];

  return (
    <>
      <dl className="my-4 border-t border-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-line py-2.5">
            <dt className="shrink-0 text-[13px] text-ink-3">{k}</dt>
            <dd className="min-w-0 truncate text-right font-medium tabular">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button size="lg" onClick={copy}>
          <Copy className="size-4" /> Copy details
        </Button>
        {'share' in navigator && (
          <Button size="lg" variant="secondary" aria-label="Share account details" onClick={share}>
            <Share2 className="size-4" />
          </Button>
        )}
      </div>
    </>
  );
}
