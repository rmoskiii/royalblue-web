import { useMutation } from '@tanstack/react-query';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { loanService } from '@/api/services/loans';
import type { ApplyLoanRequest, LoanProduct } from '@/api/types';
import { useLoanProducts } from '@/api/hooks';
import { paths } from '@/components/layout/navigation';
import { Button, Card, PageHeader, SelectField, TextField } from '@/components/ui';

type Step = 'borrower' | 'guarantor' | 'docs';

const emptyBorrower = {
  loanProductId: '',
  requestedAmount: '',
  tenorMonths: '',
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
    if (!productId && !amount && !tenor) return;
    setBorrower((b) => ({
      ...b,
      loanProductId: productId || b.loanProductId,
      requestedAmount: amount || b.requestedAmount,
      tenorMonths: tenor || b.tenorMonths,
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
              label="Product"
              required
              value={borrower.loanProductId}
              onChange={(e) => setBorrower((b) => ({ ...b, loanProductId: e.target.value }))}
              options={[
                { value: '', label: 'Select a product' },
                ...(products ?? []).map((p) => ({ value: p.id, label: p.name })),
              ]}
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
                label="Tenor (months)"
                required
                value={borrower.tenorMonths}
                onChange={(e) => setBorrower((b) => ({ ...b, tenorMonths: e.target.value }))}
                options={(product?.tenorOptions ?? [3, 6, 12]).map((n) => ({
                  value: String(n),
                  label: `${n} months`,
                }))}
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
