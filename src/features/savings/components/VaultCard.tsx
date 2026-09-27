import { Lock, Repeat } from 'lucide-react';
import type { ContributionFrequency, SavingsVault } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, Chip, Money } from '@/components/ui';
import { formatDate, formatNaira } from '@/lib/format';
import { ProgressRing } from './ProgressRing';

const frequencyLabel: Record<ContributionFrequency, string> = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
};

export function VaultCard({ vault: v }: { vault: SavingsVault }) {
  const { showToast } = useToast();
  const progress = v.target ? v.balance / v.target : null;
  const locked = v.lockedUntil && new Date(v.lockedUntil) > new Date();

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {progress !== null ? (
          <ProgressRing value={progress} label={`${v.name} goal progress`}>
            <span className="text-base font-semibold">{Math.round(progress * 100)}%</span>
          </ProgressRing>
        ) : (
          <span className="grid size-22 shrink-0 place-items-center rounded-full bg-surface-2 text-brand">
            <Lock className="size-7" />
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{v.name}</h3>
            <Chip>{v.type === 'target' ? 'Target' : 'Fixed'}</Chip>
          </div>
          <Money
            amount={v.balance}
            decimals={2}
            className="mt-1 block text-xl font-semibold tracking-tight"
          />
          {v.target && <p className="text-xs text-ink-3">of {formatNaira(v.target)} goal</p>}
        </div>
      </div>

      <ul className="grid gap-1.5 text-[13px] text-ink-2">
        {v.autoSave && (
          <li className="flex items-center gap-2">
            <Repeat className="size-4 text-ink-3" />
            Saving {formatNaira(v.autoSave.amount)} {frequencyLabel[v.autoSave.frequency]}
          </li>
        )}
        {v.lockedUntil && (
          <li className="flex items-center gap-2">
            <Lock className="size-4 text-ink-3" />
            {locked
              ? `Locked until ${formatDate(v.lockedUntil)}`
              : `Unlocked since ${formatDate(v.lockedUntil)}`}
          </li>
        )}
        <li className="text-xs text-ink-3">Earning {Math.round(v.annualRate * 100)}% a year</li>
      </ul>

      <div className="mt-auto flex gap-2">
        <Button size="sm" onClick={() => showToast('Topping up vaults is coming soon')}>
          Add money
        </Button>
        {!locked && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => showToast('Withdrawals are coming soon')}
          >
            Withdraw
          </Button>
        )}
      </div>
    </Card>
  );
}
