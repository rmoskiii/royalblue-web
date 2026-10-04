import { BrandBar, MarketingAuthButtons } from '@/components/layout/BrandBar';
import { cn } from '@/lib/cn';
import { useScrolled } from '../hooks/useScrolled';

/** Same navy bar as the hero nav. */
export function StickyHeader() {
  const visible = useScrolled(560);

  return (
    <header
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        'fixed inset-x-0 top-0 z-40 bg-[#1b194e] shadow-[0_2px_16px_-6px_rgb(0_0_0/0.35)] transition-transform duration-300',
        visible ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <BrandBar
        onDark
        showMarketingNav
        trailing={<MarketingAuthButtons onDark />}
      />
    </header>
  );
}
