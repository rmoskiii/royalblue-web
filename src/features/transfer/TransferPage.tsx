import { useState } from 'react';
import type { Beneficiary } from '@/api/types';
import { PageHeader } from '@/components/ui';
import { BeneficiaryList } from './components/BeneficiaryList';
import { TransferForm } from './components/TransferForm';

export function TransferPage() {
  const [prefill, setPrefill] = useState<Beneficiary | undefined>();
  // Bumping the key remounts the form: used to apply a beneficiary or reset after sending.
  const [formKey, setFormKey] = useState(0);

  return (
    <>
      <PageHeader title="Transfer" subtitle="Send money to any Nigerian bank account." />
      <div className="grid gap-4 xl:grid-cols-2">
        <TransferForm
          key={formKey}
          initial={prefill}
          onSent={() => {
            setPrefill(undefined);
            setFormKey((k) => k + 1);
          }}
        />
        <BeneficiaryList
          className="-order-1 xl:order-none"
          onSelect={(b) => {
            setPrefill(b);
            setFormKey((k) => k + 1);
          }}
        />
      </div>
    </>
  );
}
