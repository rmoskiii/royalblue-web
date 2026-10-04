import { BrandBar, MarketingAuthButtons } from '@/components/layout/BrandBar';
import { cn } from '@/lib/cn';
import { useScrolled } from '../hooks/useScrolled';

/** Real lockup + About / Services / Loans / Savings, shown after the hero. */
export function StickyHeader() {
  const visible = useScrolled(560);

  return (
    <header
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        'fixed inset-x-0 top-0 z-40 bg-white shadow-[0_2px_16px_-6px_rgb(27_25_77/0.18)] transition-transform duration-300',
        visible ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <BrandBar
        showMarketingNav
        trailing={<MarketingAuthButtons />}
      />
    </header>
  );
}
