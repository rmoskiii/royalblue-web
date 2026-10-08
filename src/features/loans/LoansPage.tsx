import { useRef, useState } from 'react';
import { Link } from 'react-router';
import { useLoanProducts, useLoans } from '@/api/hooks';
import type { LoanProduct } from '@/api/types';
import { paths } from '@/components/layout/navigation';
import { buttonClass, Card, Chip, PageHeader } from '@/components/ui';
import { formatNaira } from '@/lib/format';
import { ActiveLoanDetail } from './components/ActiveLoanDetail';
import { HowItWorks } from './components/HowItWorks';
import { LoanCalculator } from './components/LoanCalculator';
import { LoanProducts } from './components/LoanProducts';

export function LoansPage() {
  const { data: loans } = useLoans();
  const { data: products } = useLoanProducts();
  const [selected, setSelected] = useState<LoanProduct | null>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  const activeLoan = loans?.find((l) => l.status === 'active');
  const pipeline = loans?.filter((l) => l.status === 'pending' || l.status === 'under_review');
  const calculatorProduct = selected ?? products?.[0];

  const estimate = (product: LoanProduct) => {
    setSelected(product);
    requestAnimationFrame(() =>
      calculatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  };

  return (
    <>
      <PageHeader
        title="Loans"
        subtitle="Business and personal financing, from 2% per month."
        action={
          <Link to={paths.loanApply} className={buttonClass({ variant: 'primary', block: true })}>
            Apply for a loan
          </Link>
        }
      />
      <div className="grid gap-4">
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          {pipeline && pipeline.length > 0 && (
            <Card className="grid gap-3 p-4">
              <h2 className="text-base font-semibold">Your applications</h2>
              {pipeline.map((loan) => (
                <div key={loan.id} className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{loan.productName}</p>
                    <p className="text-[13px] text-ink-2">
                      {formatNaira(loan.principal)} · {loan.tenorMonths} months
                    </p>
                  </div>
                  <Chip>{loan.status === 'under_review' ? 'With credit' : 'Submitted'}</Chip>
                </div>
              ))}
            </Card>
          )}
          {activeLoan && <ActiveLoanDetail loan={activeLoan} />}
          {calculatorProduct && (
            <LoanCalculator
              key={calculatorProduct.id}
              ref={calculatorRef}
              product={calculatorProduct}
            />
          )}
        </div>
        {products && <LoanProducts products={products} onEstimate={estimate} />}
        <HowItWorks />
      </div>
    </>
  );
}
