import { formatNaira } from '@/lib/format';
import { cn } from '@/lib/cn';

interface MoneyProps {
  amount: number;
  decimals?: number;
  /** Prefix "+" / "−" based on the amount's sign */
  signed?: boolean;
  /** Replace digits with dots, e.g. when the balance is hidden */
  masked?: boolean;
  className?: string;
}

/** Renders a naira amount, e.g. ₦12,000,345.00, with tabular digits. */
export function Money({ amount, decimals = 0, signed, masked, className }: MoneyProps) {
  const sign = signed ? (amount > 0 ? '+' : amount < 0 ? '−' : '') : '';
  const digits = masked ? '••••••' : formatNaira(amount, decimals).slice(1);
  return (
    <span className={cn('tabular', className)}>
      {sign}₦{digits}
    </span>
  );
}
