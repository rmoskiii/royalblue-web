import { Check, LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useAccount, useBanks, useNameEnquiry } from '@/api/hooks';
import type { Beneficiary, TransferDestination } from '@/api/types';
import { Button, Card, SegmentedControl, SelectField, TextField } from '@/components/ui';
import { formatNaira, formatNumber, parseAmount } from '@/lib/format';
import { transferFee } from '../lib/fees';
import { ConfirmTransferSheet, type TransferDraft } from './ConfirmTransferSheet';

const QUICK_AMOUNTS = [5_000, 10_000, 20_000, 50_000];
const ROYALBLUE_BANK_CODE = 'royalblue';

interface TransferFormProps {
  /** Pre-fill from a tapped beneficiary. Remount with a new `key` to apply. */
  initial?: Beneficiary;
  onSent: () => void;
}

export function TransferForm({ initial, onSent }: TransferFormProps) {
  const { data: account } = useAccount();
  const { data: banks } = useBanks();

  const [destination, setDestination] = useState<TransferDestination>('other');
  const [bankCode, setBankCode] = useState(initial?.bankCode ?? '');
  const [accountNumber, setAccountNumber] = useState(initial?.accountNumber ?? '');
  const [amountInput, setAmountInput] = useState('');
  const [narration, setNarration] = useState('');
  const [draft, setDraft] = useState<TransferDraft | null>(null);

  const effectiveBank = destination === 'royalblue' ? ROYALBLUE_BANK_CODE : bankCode;
  const enquiry = useNameEnquiry(effectiveBank, accountNumber);

  const amount = parseAmount(amountInput);
  const fee = transferFee(amount, destination);
  const total = amount + fee;
  const insufficient = account ? total > account.balance : false;
  const canContinue = Boolean(enquiry.data) && amount > 0 && !insufficient;

  const bankName =
    destination === 'royalblue'
      ? 'RoyalBlue MFB'
      : (banks?.find((b) => b.code === bankCode)?.name ?? '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canContinue || !enquiry.data) return;
    setDraft({
      destination,
      bankCode: effectiveBank,
      bankName,
      accountNumber,
      accountName: enquiry.data.accountName,
      amount,
      fee,
      narration: narration.trim() || undefined,
    });
  };

  return (
    <Card>
      <SegmentedControl
        label="Send to"
        value={destination}
        onChange={setDestination}
        options={[
          { value: 'royalblue', label: 'To RoyalBlue' },
          { value: 'other', label: 'To other banks' },
        ]}
        className="mb-4.5"
      />

      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        {destination === 'other' && (
          <SelectField
            label="Bank"
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            options={[
              { value: '', label: 'Choose a bank' },
              ...(banks ?? []).map((b) => ({ value: b.code, label: b.name })),
            ]}
          />
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

        <dl className="grid gap-1.5 rounded-tile bg-surface-2 px-3.5 py-3 text-[13px]">
          <div className="flex justify-between">
            <dt className="text-ink-3">Transfer fee</dt>
            <dd className="font-semibold tabular">{fee ? formatNaira(fee, 2) : 'Free'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-3">Total</dt>
            <dd className="font-semibold tabular">{formatNaira(total, 2)}</dd>
          </div>
        </dl>

        <Button type="submit" size="lg" block disabled={!canContinue}>
          Continue
        </Button>
      </form>

      <ConfirmTransferSheet
        draft={draft}
        onClose={() => setDraft(null)}
        onSent={() => {
          setDraft(null);
          onSent();
        }}
      />
    </Card>
  );
}
