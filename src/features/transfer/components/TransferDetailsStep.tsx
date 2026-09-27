import { Check, LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAccount, useBanks, useBeneficiaries, useNameEnquiry } from '@/api/hooks';
import type { Beneficiary, TransferDestination } from '@/api/types';
import { Avatar, Button, SegmentedControl, TextField } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatNaira, formatNumber, parseAmount } from '@/lib/format';
import { avatarColour } from '../lib/avatarColour';
import { transferFee } from '../lib/fees';
import type { TransferDraft } from '../types';
import { BankPicker } from './BankPicker';

const QUICK_AMOUNTS = [5_000, 10_000, 20_000, 50_000];
const ROYALBLUE_BANK_CODE = 'royalblue';

export function TransferDetailsStep({
  initial,
  onContinue,
}: {
  initial?: Beneficiary;
  onContinue: (draft: TransferDraft) => void;
}) {
  const { data: account } = useAccount();
  const { data: banks = [] } = useBanks();
  const { data: beneficiaries } = useBeneficiaries();

  const [destination, setDestination] = useState<TransferDestination>('other');
  const [bankCode, setBankCode] = useState(initial?.bankCode ?? '');
  const [accountNumber, setAccountNumber] = useState(initial?.accountNumber ?? '');
  const [amountInput, setAmountInput] = useState('');
  const [narration, setNarration] = useState('');

  const effectiveBank = destination === 'royalblue' ? ROYALBLUE_BANK_CODE : bankCode;
  const enquiry = useNameEnquiry(effectiveBank, accountNumber);

  const amount = parseAmount(amountInput);
  const freeLeft = account?.freeTransfersRemaining ?? 0;
  const fee = transferFee(amount, destination, freeLeft);
  const total = amount + fee;
  const insufficient = account ? total > account.balance : false;
  const canContinue = Boolean(enquiry.data) && amount > 0 && !insufficient;

  const fillFrom = (b: Beneficiary) => {
    setDestination('other');
    setBankCode(b.bankCode);
    setAccountNumber(b.accountNumber);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canContinue || !enquiry.data) return;
    onContinue({
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
      narration: narration.trim() || undefined,
    });
  };

  return (
    <form className="grid grid-cols-[minmax(0,1fr)] gap-4" onSubmit={handleSubmit} noValidate>
      {beneficiaries && beneficiaries.length > 0 && (
        <div>
          <p className="mb-1.5 text-[13px] font-medium text-ink-2">Saved beneficiaries</p>
          <ul className="-mx-1 scrollbar-none flex gap-1 overflow-x-auto">
            {beneficiaries.map((b, i) => (
              <li key={b.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => fillFrom(b)}
                  className={cn(
                    'flex w-17 flex-col items-center gap-1 rounded-xl px-1 py-1.5 hover:bg-surface-2',
                    accountNumber === b.accountNumber && 'bg-surface-2',
                  )}
                >
                  <Avatar name={b.name} color={avatarColour(i)} size="lg" />
                  <span className="w-full truncate text-center text-xs">
                    {b.name.split(' ')[0]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SegmentedControl
        label="Send to"
        value={destination}
        onChange={setDestination}
        options={[
          { value: 'royalblue', label: 'To RoyalBlue' },
          { value: 'other', label: 'To other banks' },
        ]}
      />

      {destination === 'other' && (
        <BankPicker banks={banks} value={bankCode} onChange={setBankCode} />
      )}

      <div className="grid gap-2">
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
          <p className="flex items-center gap-2 rounded-field bg-success-soft px-3 py-2.25 text-[13px] font-semibold tracking-wide text-success">
            <Check className="size-4" /> {enquiry.data.accountName.toUpperCase()}
          </p>
        )}
        {enquiry.isError && (
          <p className="text-xs text-primary-text">
            We couldn’t find that account. Check the number and bank.
          </p>
        )}
      </div>

      <div className="grid gap-2">
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
          inputClassName="text-lg font-semibold tabular"
          error={insufficient ? 'This is more than your available balance.' : undefined}
          hint={account ? `Available: ${formatNaira(account.balance, 2)}` : undefined}
        />
        <div className="flex flex-wrap gap-1.5">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmountInput(formatNumber(a))}
              className="h-7.5 rounded-full border border-line bg-surface px-3 text-[13px] font-medium hover:border-brand"
            >
              {formatNaira(a)}
            </button>
          ))}
        </div>
      </div>

      <TextField
        label={
          <>
            Description <span className="text-ink-3">(optional)</span>
          </>
        }
        placeholder="What is it for?"
        maxLength={60}
        value={narration}
        onChange={(e) => setNarration(e.target.value)}
      />

      {/* Live fee indicator (PRD View 3) */}
      <div className="grid gap-1 rounded-tile bg-surface-2 px-3.5 py-3 text-[13px]">
        <div className="flex justify-between">
          <span className="text-ink-3">Fee</span>
          <b className={cn('tabular', fee === 0 && 'text-success')}>{formatNaira(fee, 2)}</b>
        </div>
        {destination === 'other' && account && (
          <p className="text-xs text-ink-3">
            {freeLeft > 0
              ? `${freeLeft} of ${account.freeTransfersPerMonth} free transfers to other banks left this month`
              : 'You’ve used this month’s free transfers, so the standard fee applies'}
          </p>
        )}
        <div className="mt-1 flex justify-between border-t border-line pt-2">
          <span className="text-ink-3">Total</span>
          <b className="tabular">{formatNaira(total, 2)}</b>
        </div>
      </div>

      <Button type="submit" size="lg" block disabled={!canContinue} className="rounded-full">
        Complete transfer
      </Button>
    </form>
  );
}
