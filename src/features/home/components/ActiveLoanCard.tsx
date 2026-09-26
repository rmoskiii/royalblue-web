import { Store } from 'lucide-react';
import { Link } from 'react-router';
import { useLoans } from '@/api/hooks';
import { useToast } from '@/app/providers/ToastProvider';
import { paths } from '@/components/layout/navigation';
import { Button, Card, Chip, IconTile, Money, ProgressBar, buttonClass } from '@/components/ui';
import { summariseLoan } from '@/features/loans/lib/amortization';
import { formatDate } from '@/lib/format';

export function ActiveLoanCard() {
  const { data: loans } = useLoans();
  const { showToast } = useToast();
  const loan = loans?.find((l) => l.status === 'active');
  if (!loan) return null;

  const s = summariseLoan(loan);

  return (
    <Card>
      <div className="flex items-center gap-2.5">
        <IconTile icon={Store} className="size-9 rounded-[10px] text-tint-loans" />
        <div className="min-w-0">
          <p className="font-semibold">{loan.productName}</p>
          <p className="text-xs text-ink-3">
            Disbursed {formatDate(loan.disbursedAt)} · {loan.tenorMonths} months
          </p>
        </div>
        <Chip tone="success" className="ml-auto">
          Active
        </Chip>
      </div>

      <div className="mt-3.5 mb-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">
        <Money
          amount={s.leftToRepay}
          className="font-display text-[28px] leading-none font-medium tracking-tight text-brand"
        />
        <span className="text-ink-3">
          left to repay of <Money amount={s.totalRepayable} />
        </span>
      </div>
      <ProgressBar value={s.progress} label="Loan repaid" />
      <div className="mt-1.5 flex justify-between text-xs text-ink-3">
        <span>
          {loan.repaymentsMade} of {loan.tenorMonths} repayments made
        </span>
        <span>Ends {formatDate(s.endDate)}</span>
      </div>

      {s.nextDueDate && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-tile bg-surface-2 px-3.5 py-3">
          <div>
            <p className="text-xs text-ink-3">Next repayment</p>
            <p className="font-semibold">
              <Money amount={s.monthlyPayment} /> · {formatDate(s.nextDueDate)}
            </p>
          </div>
          {loan.autoDebit && <Chip>Auto-debit on</Chip>}
        </div>
      )}

      <div className="mt-3.5 flex flex-wrap gap-2">
        <Button onClick={() => showToast('Early repayment is coming soon')}>Repay early</Button>
        <Link to={paths.loans} className={buttonClass({ variant: 'secondary' })}>
          View schedule
        </Link>
      </div>
    </Card>
  );
}
