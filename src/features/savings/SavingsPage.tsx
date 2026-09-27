import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useSavingsSummary, useVaults } from '@/api/hooks';
import { Button, PageHeader } from '@/components/ui';
import { CreateVaultModal } from './components/CreateVaultModal';
import { SavingsBanner } from './components/SavingsBanner';
import { VaultCard } from './components/VaultCard';
import { YieldCalculator } from './components/YieldCalculator';

/** PRD View 4: Smart savings & yield vaults. */
export function SavingsPage() {
  const { data: vaults } = useVaults();
  const { data: summary } = useSavingsSummary();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Savings"
        subtitle="Grow your money with target and fixed vaults."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> New vault
          </Button>
        }
      />
      <div className="grid gap-4">
        <SavingsBanner />
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section>
            <h2 className="sr-only">Your vaults</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {vaults?.map((v) => (
                <VaultCard key={v.id} vault={v} />
              ))}
            </div>
          </section>
          {summary && <YieldCalculator annualRate={summary.annualRate} />}
        </div>
      </div>
      <CreateVaultModal
        key={String(createOpen)}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  );
}
