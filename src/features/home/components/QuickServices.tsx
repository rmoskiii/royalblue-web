import { History, Landmark, Send, ShieldCheck, Zap, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { IconTile } from '@/components/ui';

// Tints come from the Figma colour variables. Airtime/data live inside Pay bills.
const services: { label: string; to: string; icon: LucideIcon; tint: string }[] = [
  { label: 'Bills', to: paths.payBills, icon: Zap, tint: 'text-tint-bills' },
  { label: 'Send', to: paths.transfer, icon: Send, tint: 'text-brand' },
  { label: 'Loans', to: paths.loans, icon: Landmark, tint: 'text-tint-loans' },
  { label: 'Activity', to: paths.transactions, icon: History, tint: 'text-ink-2' },
  { label: 'Limits', to: paths.verification, icon: ShieldCheck, tint: 'text-primary-text' },
];

export function QuickServices() {
  return (
    <nav aria-label="Quick services" className="grid grid-cols-3 gap-1 sm:grid-cols-5 sm:gap-2">
      {services.map(({ label, to, icon, tint }) => (
        <Link
          key={label}
          to={to}
          className="flex min-w-0 flex-col items-center gap-1.5 rounded-tile border border-line bg-surface px-1 py-2.5 text-center text-xs font-medium hover:bg-surface-2 md:flex-row md:gap-2.5 md:px-3 md:py-2.5 md:text-sm"
        >
          <IconTile icon={icon} className={`${tint} md:size-8 md:rounded-[9px]`} />
          <span className="text-ink">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
