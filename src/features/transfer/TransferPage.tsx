import { Check, LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAccount, useBanks, useBeneficiaries, useNameEnquiry } from '@/api/hooks';
import type { Beneficiary, TransferDestination } from '@/api/types';
import { Avatar, Button, TextField } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatNaira, formatNumber, parseAmount } from '@/lib/format';
import { BankPicker } from './components/BankPicker';
import { TransferModal } from './components/TransferModal';
import { avatarColour } from './lib/avatarColour';
import { transferFee } from './lib/fees';
import type { TransferDraft } from './types';

const ROYALBLUE_BANK_CODE = 'royalblue';

/** Full-page transfer from the RoyalBlue Dash Figma (To RoyalBlue / other banks). */
export function TransferPage() {
  const { data: account } = useAccount();
  const { data: banks = [] } = useBanks();
  const { data: beneficiaries = [] } = useBeneficiaries();
  const [destination, setDestination] = useState<TransferDestination>('royalblue');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [draft, setDraft] = useState<TransferDraft | undefined>();

  const effectiveBank = destination === 'royalblue' ? ROYALBLUE_BANK_CODE : bankCode;
  const enquiry = useNameEnquiry(effectiveBank, accountNumber);
  const amount = parseAmount(amountInput);
  const fee = transferFee(amount, destination, account?.freeTransfersRemaining ?? 0);

  const fillFrom = (b: Beneficiary) => {
    setDestination('other');
    setBankCode(b.bankCode);
    setAccountNumber(b.accountNumber);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!enquiry.data || amount <= 0) return;
    setDraft({
      destination,
      bankCode: effectiveBank,
      bankName:
        destination === 'royalblue'
          ? 'RoyalBlue MFB'
          : (banks.find((b) => b.code === bankCode)?.name ?? ''),
      accountNumber,
      accountName: enquiry.data.accountName,
      amount,
      fee,
    });
  };

  return (
    <div className="grid min-w-0 gap-5">
      <h1 className="text-[24px] font-semibold tracking-tight text-brand sm:text-[28px] lg:text-[34px]">Transfer</h1>
      <div className="min-w-0 overflow-x-hidden rounded-[26px] border border-line bg-surface p-3.5 sm:p-4 lg:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
          <form className="grid min-w-0 gap-4" onSubmit={handleSubmit} noValidate>
            <div className="flex h-12 w-full rounded-[12px] bg-surface-2 p-1">
              {(
                [
                  ['royalblue', 'To RoyalBlue'],
                  ['other', 'To other banks'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDestination(value)}
                  className={cn(
                    'flex-1 rounded-[10px] px-1 text-xs font-medium sm:text-sm',
                    destination === value ? 'bg-surface text-brand shadow-sm' : 'text-ink-3',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {destination === 'other' && (
              <BankPicker banks={banks} value={bankCode} onChange={setBankCode} />
            )}

            <TextField
              label="Account number"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              placeholder="10-digit account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              inputClassName="tabular"
            />
            {enquiry.isFetching && (
              <p className="flex items-center gap-2 text-[13px] text-ink-3">
                <LoaderCircle className="size-4 animate-spin" /> Checking account…
              </p>
            )}
            {enquiry.data && !enquiry.isFetching && (
              <p className="flex items-center gap-2 text-[13px] font-semibold text-success">
                <Check className="size-4" /> {enquiry.data.accountName}
              </p>
            )}

            <TextField
              label="Amount"
              prefix="₦"
              inputMode="numeric"
              placeholder="0"
              value={amountInput}
              onChange={(e) => {
                const n = parseAmount(e.target.value);
                setAmountInput(n ? formatNumber(n) : '');
              }}
              hint={account ? `Available: ${formatNaira(account.balance, 2)}` : undefined}
            />

            <Button type="submit" size="lg" disabled={!enquiry.data || amount <= 0} className="w-full lg:w-40">
              Continue
            </Button>
          </form>

          <div className="min-w-0">
            <p className="mb-4 text-lg font-semibold">Beneficiaries</p>
            {beneficiaries.length === 0 ? (
              <p className="text-sm text-ink-3">Saved recipients will show here after your first transfer.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {beneficiaries.map((b, i) => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => fillFrom(b)}
                      className="flex w-full flex-col items-start gap-2 rounded-2xl p-2 text-left hover:bg-surface-2"
                    >
                      <Avatar name={b.name} color={avatarColour(i)} size="lg" />
                      <span className="w-full truncate text-sm font-semibold">{b.name}</span>
                      <span className="w-full truncate text-xs text-ink-3">
                        {b.accountNumber} · {b.bankName}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {draft && (
        <TransferModal preset={draft} onClose={() => setDraft(undefined)} />
      )}
    </div>
  );
}
