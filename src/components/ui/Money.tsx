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

/**
 * Renders a naira amount. The ₦ glyph is always set in Inter because many
 * display serifs (including the Erstoria stand-in) don't include it.
 */
export function Money({ amount, decimals = 0, signed, masked, className }: MoneyProps) {
  const sign = signed ? (amount > 0 ? '+' : amount < 0 ? '−' : '') : '';
  const digits = masked ? '••••••' : formatNaira(amount, decimals).slice(1);
  return (
    <span className={cn('tabular', className)}>
      {sign}
      <span className="font-sans">₦</span>
      {digits}
    </span>
  );
}
