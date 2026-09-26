import { Store } from 'lucide-react';
import type { Loan } from '@/api/types';
import { useToast } from '@/app/providers/ToastProvider';
import { Button, Card, Chip, IconTile, Money, ProgressBar } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { summariseLoan } from '../lib/amortization';
import { RepaymentSchedule } from './RepaymentSchedule';

export function ActiveLoanDetail({ loan }: { loan: Loan }) {
  const { showToast } = useToast();
  const s = summariseLoan(loan);

  return (
    <Card>
      <div className="flex items-center gap-2.5">
        <IconTile icon={Store} className="size-9 rounded-[10px] text-tint-loans" />
        <div className="min-w-0">
          <p className="font-semibold">{loan.productName}</p>
          <p className="text-xs text-ink-3">
            <Money amount={loan.principal} /> at {loan.monthlyRate * 100}% per month ·{' '}
            {loan.tenorMonths} months
          </p>
        </div>
        <Chip tone="success" className="ml-auto">
          Active
        </Chip>
      </div>

      <div className="mt-3.5 mb-2.5 flex flex-wrap items-baseline gap-2.5">
        <Money
          amount={s.leftToRepay}
          className="font-display text-[28px] leading-none font-medium tracking-tight text-brand"
        />
        <span className="text-ink-3">left to repay</span>
      </div>
      <ProgressBar value={s.progress} label="Loan repaid" />
      <div className="mt-1.5 flex flex-wrap justify-between gap-2 text-xs text-ink-3">
        <span>
          {loan.repaymentsMade} of {loan.tenorMonths} paid
        </span>
        {s.nextDueDate && (
          <span>
            Next: <Money amount={s.monthlyPayment} className="font-semibold text-ink" /> on{' '}
            {formatDate(s.nextDueDate)}
          </span>
        )}
      </div>

      <RepaymentSchedule loan={loan} />

      <div className="mt-3.5 flex flex-wrap gap-2">
        <Button onClick={() => showToast('Repayments are coming soon')}>Repay now</Button>
        <Button variant="secondary" onClick={() => showToast('Statements are coming soon')}>
          Download statement
        </Button>
      </div>
    </Card>
  );
}
