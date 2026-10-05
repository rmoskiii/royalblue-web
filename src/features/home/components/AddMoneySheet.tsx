import { ChevronRight, CreditCard, FlaskConical, Landmark } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, useAccount } from '@/api/hooks';
import { accountService } from '@/api/services/accounts';
import { useToast } from '@/app/providers/ToastProvider';
import { Modal } from '@/components/ui';
import { AccountDetails } from './AccountDetails';

type Method = 'choose' | 'bank-transfer';

export function AddMoneySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [method, setMethod] = useState<Method>('choose');
  const { data: account } = useAccount();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const close = () => {
    setMethod('choose');
    onClose();
  };

  const sandboxTopUp = useMutation({
    mutationFn: () => accountService.sandboxFund(50_000),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.account });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.insights });
      showToast(`₦${result.amount.toLocaleString('en-NG')} test credit landed`);
      close();
    },
    onError: (error) => showToast(error.message),
  });

  const cardTopUp = useMutation({
    mutationFn: () => accountService.startCardTopup(5_000),
    onSuccess: ({ authorizationUrl }) => {
      if (!authorizationUrl) {
        showToast('BudPay did not return a checkout URL');
        return;
      }
      window.location.assign(authorizationUrl);
    },
    onError: (error) => showToast(error.message),
  });

  const options = [
    {
      icon: Landmark,
      title: 'Bank transfer',
      body: 'Send money from any Nigerian bank app to your RoyalBlue account.',
      onClick: () => setMethod('bank-transfer'),
    },
    {
      icon: CreditCard,
      title: 'Debit card',
      body: 'Pay on BudPay checkout (Visa, Mastercard or Verve). Test cards work with a test secret key.',
      onClick: () => cardTopUp.mutate(),
    },
  ];
  if (account?.sandbox) {
    options.push({
      icon: FlaskConical,
      title: 'BudPay sandbox top-up',
      body: 'Credit ₦50,000 through the dedicated-account webhook payload (test keys / mock).',
      onClick: () => sandboxTopUp.mutate(),
    });
  }

  return (
    <Modal open={open} onClose={close} title="Add money">
      <div className="px-4 pt-2 pb-4">
        {method === 'choose' ? (
          <ul className="grid gap-2">
            {options.map(({ icon: Icon, title, body, onClick }) => (
              <li key={title}>
                <button
                  type="button"
                  onClick={onClick}
                  className="flex w-full items-center gap-3 rounded-tile border border-line p-3.5 text-left hover:bg-surface-2"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{title}</span>
                    <span className="text-[13px] text-ink-2">{body}</span>
                  </span>
                  <ChevronRight className="size-4 text-ink-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="text-ink-2">
              This is your BudPay dedicated virtual account. Transfer from any Nigerian bank; the
              credit webhook (or a dashboard sync) lands it on your RoyalBlue balance.
            </p>
            <AccountDetails />
          </>
        )}
      </div>
    </Modal>
  );
}
