import { useRef, useState } from 'react';
import { useLoanProducts, useLoans } from '@/api/hooks';
import type { LoanProduct } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, PageHeader } from '@/components/ui';
import { ActiveLoanDetail } from './components/ActiveLoanDetail';
import { HowItWorks } from './components/HowItWorks';
import { LoanCalculator } from './components/LoanCalculator';
import { LoanProducts } from './components/LoanProducts';

export function LoansPage() {
  const { data: loans } = useLoans();
  const { data: products } = useLoanProducts();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<LoanProduct | null>(null);
  const calculatorRef = useRef<HTMLDivElement>(null);

  const activeLoan = loans?.find((l) => l.status === 'active');
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
          <Button onClick={() => showToast('The application form is next on the build list')}>
            Apply for a loan
          </Button>
        }
      />
      <div className="grid gap-4">
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
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
