import { Copy, Eye, EyeOff, Plus, QrCode, Send, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useAccount } from '@/api/hooks';
import { useToast } from '@/app/providers/ToastProvider';
import { paths } from '@/components/layout/navigation';
import { Button, Chip, Money, buttonClass } from '@/components/ui';
import { formatAccountNumber } from '@/lib/format';
import { copyText } from '@/lib/clipboard';

/** Phone: 4 stacked icon buttons. Tablet up: a row of labelled buttons. */
const actionClass =
  'flex-col gap-1.25 h-auto px-1 py-2.5 text-xs md:h-10 md:flex-row md:gap-2 md:px-4 md:text-sm';

export function BalanceCard({ onAddMoney }: { onAddMoney: () => void }) {
  const { data: account, isLoading } = useAccount();
  const [hidden, setHidden] = useState(false);
  const { showToast } = useToast();

  const copyAccountNumber = async () => {
    if (!account) return;
    await copyText(account.accountNumber);
    showToast('Account number copied');
  };

  return (
    <section
      aria-label="Balance"
      className="relative overflow-hidden rounded-card bg-navy bg-[linear-gradient(180deg,rgb(201_60_56/0)_40%,rgb(201_60_56)_256%)] p-5 text-white md:px-6.5 md:py-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] text-white/75">
          Total balance
          <button
            type="button"
            onClick={() => setHidden((h) => !h)}
            aria-label={hidden ? 'Show balance' : 'Hide balance'}
            className="grid p-0.5 text-white/70 hover:text-white"
          >
            {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {account && <Chip tone="onDark">Tier {account.tier}</Chip>}
      </div>

      {isLoading || !account ? (
        <div className="my-3 h-10 w-64 animate-pulse rounded-lg bg-white/10" />
      ) : (
        <Money
          amount={account.balance}
          decimals={2}
          masked={hidden}
          className="mt-2.5 mb-1 block font-display text-4xl leading-tight font-medium tracking-tight md:text-[44px]"
        />
      )}

      {account && (
        <button
          type="button"
          onClick={copyAccountNumber}
          className="inline-flex h-8 items-center gap-2 rounded-[9px] border border-white/15 bg-white/12 px-2.5 text-[13px] font-medium hover:bg-white/20"
        >
          <span className="font-normal text-white/65">{account.bankName}</span>
          <span className="tabular">{formatAccountNumber(account.accountNumber)}</span>
          <Copy className="size-3.5" />
        </button>
      )}

      <div className="mt-4.5 grid grid-cols-4 gap-2 md:flex md:flex-wrap">
        <Button className={actionClass} onClick={onAddMoney}>
          <Plus className="size-4" /> Add money
        </Button>
        <Link
          to={paths.transfer}
          className={buttonClass({ variant: 'glass', className: actionClass })}
        >
          <Send className="size-4" /> Transfer
        </Link>
        <Link
          to={paths.payBills}
          className={buttonClass({ variant: 'glass', className: actionClass })}
        >
          <Zap className="size-4" /> Pay
        </Link>
        <Button
          variant="glass"
          className={actionClass}
          aria-label="Scan to pay"
          onClick={() => showToast('Scan to pay is coming soon')}
        >
          <QrCode className="size-4" /> <span className="md:sr-only">Scan</span>
        </Button>
      </div>
    </section>
  );
}
