import { ChevronRight, CreditCard, Landmark } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/app/providers/ToastProvider';
import { Modal } from '@/components/ui';
import { AccountDetails } from './AccountDetails';

type Method = 'choose' | 'bank-transfer';

export function AddMoneySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [method, setMethod] = useState<Method>('choose');
  const { showToast } = useToast();
  const close = () => {
    setMethod('choose');
    onClose();
  };

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
      body: 'Top up instantly with a Visa, Mastercard or Verve card.',
      onClick: () => showToast('Card top-ups are coming soon'),
    },
  ];

  return (
    <Modal open={open} onClose={close} title="Add money">
      <div className="px-5.5 pt-2 pb-5.5">
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
              Transfer to this account from any bank. It lands instantly.
            </p>
            <AccountDetails />
          </>
        )}
      </div>
    </Modal>
  );
}
