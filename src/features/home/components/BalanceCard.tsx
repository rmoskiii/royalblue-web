import { ArrowDownLeft, Copy, Eye, EyeOff, Plus, Send, Zap } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useAccount } from '@/api/hooks';
import { useToast } from '@/app/providers/ToastProvider';
import { paths } from '@/components/layout/navigation';
import { Button, Money, buttonClass } from '@/components/ui';
import { useTransfer } from '@/features/transfer/TransferProvider';
import { copyText } from '@/lib/clipboard';
import { formatAccountNumber } from '@/lib/format';

/** PRD View 1: balance with a one-tap privacy toggle, then quick actions (2×2 on phones). */
export function BalanceCard({
  onReceive,
  onAddMoney,
}: {
  onReceive: () => void;
  onAddMoney: () => void;
}) {
  const { data: account, isLoading } = useAccount();
  const [hidden, setHidden] = useState(false);
  const { showToast } = useToast();
  const { openTransfer } = useTransfer();

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

      {isLoading || !account ? (
        <div className="my-3 h-10 w-64 animate-pulse rounded-lg bg-white/10" />
      ) : (
        <Money
          amount={account.balance}
          decimals={2}
          masked={hidden}
          className="mt-2 mb-2 block text-[34px] leading-tight font-semibold tracking-tight md:text-[42px]"
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

      <div className="mt-5 grid grid-cols-2 gap-2 md:flex md:flex-wrap">
        <Button onClick={() => openTransfer()}>
          <Send className="size-4" /> Send money
        </Button>
        <Button variant="glass" onClick={onReceive}>
          <ArrowDownLeft className="size-4" /> Receive
        </Button>
        <Link to={paths.payBills} className={buttonClass({ variant: 'glass' })}>
          <Zap className="size-4" /> Pay bills
        </Link>
        <Button variant="glass" onClick={onAddMoney}>
          <Plus className="size-4" /> Add money
        </Button>
      </div>
    </section>
  );
}
