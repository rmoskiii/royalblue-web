import { CreditCard, Landmark, Smartphone, Wifi, Zap, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { IconTile } from '@/components/ui';

// Tints come from the Figma colour variables.
const services: { label: string; to: string; icon: LucideIcon; tint: string }[] = [
  {
    label: 'Airtime',
    to: `${paths.payBills}?type=airtime`,
    icon: Smartphone,
    tint: 'text-tint-airtime',
  },
  { label: 'Data', to: `${paths.payBills}?type=data`, icon: Wifi, tint: 'text-tint-data' },
  { label: 'Bills', to: paths.payBills, icon: Zap, tint: 'text-tint-bills' },
  { label: 'Card', to: paths.cards, icon: CreditCard, tint: 'text-tint-card' },
  { label: 'Loans', to: paths.loans, icon: Landmark, tint: 'text-tint-loans' },
];

export function QuickServices() {
  return (
    <nav aria-label="Quick services" className="grid grid-cols-5 gap-2">
      {services.map(({ label, to, icon, tint }) => (
        <Link
          key={label}
          to={to}
          className="flex flex-col items-center gap-1.75 rounded-tile border border-line bg-surface px-1 py-3 text-xs font-medium hover:bg-surface-2 md:flex-row md:gap-2.5 md:px-3 md:py-2.5 md:text-sm"
        >
          <IconTile icon={icon} className={`${tint} md:size-8 md:rounded-[9px]`} />
          <span className="text-ink">{label}</span>
        </Link>
      ))}
    </nav>
  );
}
