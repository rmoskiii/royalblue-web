import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { loanService } from '@/api/services/loans';
import type { ApplyLoanRequest, LoanProduct, RepaymentFrequency } from '@/api/types';
import { useLoanProducts } from '@/api/hooks';
import { paths } from '@/components/layout/navigation';
import { Button, Card, PageHeader, SelectField, TextField } from '@/components/ui';
import { ALLOWED_LOAN_TENORS, LOAN_TYPES } from './lib/amortization';

type Step = 'borrower' | 'guarantor' | 'docs';

const emptyBorrower = {
  loanProductId: '',
  requestedAmount: '',
  tenorMonths: '3',
  repaymentFrequency: 'MONTHLY' as RepaymentFrequency,
  offeredInterestRatePA: '',
  offeredEquityPercent: '',
  purpose: '',
  ippisNumber: '',
  residentialAddress: '',
  employerName: '',
  jobTitle: '',
  monthlyNetIncome: '',
  salaryBankName: '',
  salaryAccountNumber: '',
  nextOfKinName: '',
  nextOfKinPhone: '',
  nextOfKinRelationship: '',
};

const emptyGuarantor = {
  fullName: '',
  email: '',
  phone: '',
  employer: '',
  occupation: '',
  residentialAddress: '',
  relationship: '',
  bvn: '',
  income: '',
  bankName: '',
  accountNumber: '',
};

/** Paper loan application + personal guarantor form, as used on the credit desk. */
export function ApplyLoanPage() {
  const { data: products } = useLoanProducts();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState<Step>('borrower');
  const [borrower, setBorrower] = useState(emptyBorrower);
  const [guarantor, setGuarantor] = useState(emptyGuarantor);
  const [files, setFiles] = useState<File[]>([]);
  const submit = useMutation({
    mutationFn: () => loanService.apply(toRequest(borrower, guarantor, products), files),
    onSuccess: () => navigate(paths.loans, { replace: true }),
  });

  useEffect(() => {
    const productId = params.get('product') ?? '';
    const amount = params.get('amount') ?? '';
    const tenor = params.get('tenor') ?? '';
    const rate = params.get('rate') ?? '';
    const equity = params.get('equity') ?? '';
    const frequency = params.get('frequency') ?? '';
    if (!productId && !amount && !tenor && !rate && !equity && !frequency) return;
    setBorrower((b) => ({
      ...b,
      loanProductId: productId || b.loanProductId,
      requestedAmount: amount || b.requestedAmount,
      tenorMonths: tenor || b.tenorMonths,
      repaymentFrequency:
        frequency === 'DAILY' || frequency === 'WEEKLY' || frequency === 'MONTHLY'
          ? frequency
          : b.repaymentFrequency,
      offeredInterestRatePA: rate || b.offeredInterestRatePA,
      offeredEquityPercent: equity || b.offeredEquityPercent,
    }));
  }, [params]);

  const product = products?.find((p) => p.id === borrower.loanProductId);

  return (
    <>
      <PageHeader
        title="Loan application"
        subtitle="Same details as the paper application and personal guarantor form."
      />
      <Card className="grid w-full max-w-3xl gap-5 p-4 sm:p-5">
        {step === 'borrower' && (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep('guarantor');
            }}
          >
            <h2 className="text-base font-semibold">1. Applicant</h2>
            <SelectField
              label="Loan category"
              required
              value={borrower.loanProductId}
              onChange={(e) => {
                const loanProductId = e.target.value;
                const next = products?.find((p) => p.id === loanProductId);
                setBorrower((b) => ({
                  ...b,
                  loanProductId,
                  tenorMonths: b.tenorMonths || '3',
                  offeredInterestRatePA:
                    b.offeredInterestRatePA || (next ? String(next.indicativeRatePA) : ''),
                  offeredEquityPercent: b.offeredEquityPercent === '' ? '20' : b.offeredEquityPercent,
                }));
              }}
              options={[
                { value: '', label: 'Select a category' },
                ...(products ?? []).map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
            <SelectField
              label="Repayment"
              required
              value={borrower.repaymentFrequency}
              onChange={(e) =>
                setBorrower((b) => ({ ...b, repaymentFrequency: e.target.value as RepaymentFrequency }))
              }
              options={LOAN_TYPES}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Amount requested (₦)"
                inputMode="numeric"
                required
                value={borrower.requestedAmount}
                onChange={(e) => setBorrower((b) => ({ ...b, requestedAmount: e.target.value }))}
              />
              <SelectField
                label="Tenor"
                required
                value={borrower.tenorMonths}
                onChange={(e) => setBorrower((b) => ({ ...b, tenorMonths: e.target.value }))}
                options={ALLOWED_LOAN_TENORS.map((months) => ({
                  value: String(months),
                  label: `${months} months`,
                }))}
              />
              <TextField
                label="Interest rate you are offering (% p.a.)"
                type="number"
                min={0}
                max={60}
                step={0.5}
                required
                value={borrower.offeredInterestRatePA}
                onChange={(e) => setBorrower((b) => ({ ...b, offeredInterestRatePA: e.target.value }))}
                hint={
                  product
                    ? `Catalogue for this category is ${product.indicativeRatePA}% p.a. You can offer another rate; credit approves or declines.`
                    : `Offer any rate from 0% to 60% p.a. Credit approves or declines.`
                }
              />
              <TextField
                label="Equity you will hold (%)"
                type="number"
                min={0}
                max={20}
                step={0.5}
                required
                value={borrower.offeredEquityPercent}
                onChange={(e) => setBorrower((b) => ({ ...b, offeredEquityPercent: e.target.value }))}
                hint="0% to 20% of the amount requested. Credit may change this."
              />
            </div>
            <TextField
              label="Purpose"
              required
              value={borrower.purpose}
              onChange={(e) => setBorrower((b) => ({ ...b, purpose: e.target.value }))}
            />
            <TextField
              label="Residential address"
              required
              value={borrower.residentialAddress}
              onChange={(e) => setBorrower((b) => ({ ...b, residentialAddress: e.target.value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Employer"
                required
                value={borrower.employerName}
                onChange={(e) => setBorrower((b) => ({ ...b, employerName: e.target.value }))}
              />
              <TextField
                label="Job title"
                value={borrower.jobTitle}
                onChange={(e) => setBorrower((b) => ({ ...b, jobTitle: e.target.value }))}
              />
              <TextField
                label="Monthly net income (₦)"
                inputMode="numeric"
                required
                value={borrower.monthlyNetIncome}
                onChange={(e) => setBorrower((b) => ({ ...b, monthlyNetIncome: e.target.value }))}
              />
              <TextField
                label="IPPIS number (if applicable)"
                value={borrower.ippisNumber}
                onChange={(e) => setBorrower((b) => ({ ...b, ippisNumber: e.target.value }))}
              />
              <TextField
                label="Salary bank"
                value={borrower.salaryBankName}
                onChange={(e) => setBorrower((b) => ({ ...b, salaryBankName: e.target.value }))}
              />
              <TextField
                label="Salary account number"
                inputMode="numeric"
                value={borrower.salaryAccountNumber}
                onChange={(e) => setBorrower((b) => ({ ...b, salaryAccountNumber: e.target.value }))}
              />
            </div>
            <h3 className="text-sm font-semibold">Next of kin</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <TextField
                label="Name"
                required
                value={borrower.nextOfKinName}
                onChange={(e) => setBorrower((b) => ({ ...b, nextOfKinName: e.target.value }))}
              />
              <TextField
                label="Phone"
                required
                value={borrower.nextOfKinPhone}
                onChange={(e) => setBorrower((b) => ({ ...b, nextOfKinPhone: e.target.value }))}
              />
              <TextField
                label="Relationship"
                required
                value={borrower.nextOfKinRelationship}
                onChange={(e) => setBorrower((b) => ({ ...b, nextOfKinRelationship: e.target.value }))}
              />
            </div>
            <label className="flex gap-2 text-sm text-ink-2">
              <input type="checkbox" required className="mt-1" />
              I confirm the details on this application are true and I authorise salary deduction if approved.
            </label>
            <Button type="submit" size="lg">
              Continue to guarantor
            </Button>
          </form>
        )}

        {step === 'guarantor' && (
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep('docs');
            }}
          >
            <h2 className="text-base font-semibold">2. Personal guarantor</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ['fullName', 'Full name'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['employer', 'Employer'],
                  ['occupation', 'Occupation'],
                  ['relationship', 'Relationship to applicant'],
                  ['residentialAddress', 'Residential address'],
                  ['bvn', 'BVN'],
                  ['income', 'Monthly income (₦)'],
                  ['bankName', 'Bank'],
                  ['accountNumber', 'Account number'],
                ] as const
              ).map(([key, label]) => (
                <TextField
                  key={key}
                  label={label}
                  required={key !== 'bvn' && key !== 'bankName' && key !== 'accountNumber'}
                  value={guarantor[key]}
                  onChange={(e) => setGuarantor((g) => ({ ...g, [key]: e.target.value }))}
                />
              ))}
            </div>
            <label className="flex gap-2 text-sm text-ink-2">
              <input type="checkbox" required className="mt-1" />
              I agree to guarantee this facility and to honour outstanding sums if the borrower defaults.
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep('borrower')}>
                Back
              </Button>
              <Button type="submit">Continue to documents</Button>
            </div>
          </form>
        )}

        {step === 'docs' && (
          <form className="grid gap-4" onSubmit={(e: FormEvent) => { e.preventDefault(); submit.mutate(); }}>
            <h2 className="text-base font-semibold">3. Supporting documents</h2>
            <p className="text-sm text-ink-2">
              Upload payslips, government ID, and any other papers the credit desk currently collects with the
              application pack.
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
            {files.length > 0 && (
              <ul className="text-sm text-ink-2">
                {files.map((file) => (
                  <li key={file.name}>{file.name}</li>
                ))}
              </ul>
            )}
            {submit.isError && <p className="text-[13px] text-primary-text">{submit.error.message}</p>}
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep('guarantor')}>
                Back
              </Button>
              <Button type="submit" disabled={submit.isPending}>
                {submit.isPending ? 'Submitting…' : 'Submit application'}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </>
  );
}

function toRequest(
  borrower: typeof emptyBorrower,
  guarantor: typeof emptyGuarantor,
  products: LoanProduct[] | undefined,
): ApplyLoanRequest {
  const product = products?.find((p) => p.id === borrower.loanProductId);
  return {
    application: {
      loanProductId: borrower.loanProductId || product?.id || '',
      requestedAmount: Number(borrower.requestedAmount),
      tenorMonths: Number(borrower.tenorMonths),
      repaymentFrequency: borrower.repaymentFrequency,
      offeredInterestRatePA: Number(borrower.offeredInterestRatePA),
      offeredEquityPercent: Number(borrower.offeredEquityPercent),
      purpose: borrower.purpose,
      ippisNumber: borrower.ippisNumber || undefined,
      nextOfKinName: borrower.nextOfKinName,
      nextOfKinPhone: borrower.nextOfKinPhone,
      nextOfKinRelationship: borrower.nextOfKinRelationship,
      salaryBankName: borrower.salaryBankName || undefined,
      salaryAccountNumber: borrower.salaryAccountNumber || undefined,
      residentialAddress: borrower.residentialAddress,
      employerName: borrower.employerName,
      jobTitle: borrower.jobTitle || undefined,
      monthlyNetIncome: Number(borrower.monthlyNetIncome),
      declarationAccepted: true,
    },
    guarantor: {
      fullName: guarantor.fullName,
      email: guarantor.email,
      phone: guarantor.phone,
      employer: guarantor.employer,
      occupation: guarantor.occupation,
      residentialAddress: guarantor.residentialAddress,
      relationship: guarantor.relationship,
      bvn: guarantor.bvn || undefined,
      income: Number(guarantor.income),
      bankName: guarantor.bankName || undefined,
      accountNumber: guarantor.accountNumber || undefined,
      declarationAccepted: true,
    },
  };
}
