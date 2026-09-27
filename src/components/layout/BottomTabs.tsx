import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NavEntry } from './NavEntry';
import { useProfile } from '@/app/providers/ProfileProvider';
import { navigationFor } from './navigation';

const tabClass = (isActive: boolean) =>
  cn(
    'flex flex-col items-center gap-0.75 py-1.5 text-[11px] font-medium text-ink-3',
    isActive && 'text-primary-text',
  );

/** Phone navigation for the active profile, plus More. */
export function BottomTabs({ onMore, className }: { onMore: () => void; className?: string }) {
  const { mobileTabs } = navigationFor(useProfile().profileType);
  return (
    <nav
      aria-label="Main"
      className={cn(
        'grid grid-cols-5 border-t border-line bg-surface px-1 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {mobileTabs.map((item) => {
        const Icon = item.icon;
        return (
          <NavEntry key={item.label} item={item} className={tabClass}>
            <Icon className="size-5" strokeWidth={1.8} />
            {item.label}
          </NavEntry>
        );
      })}
      <button type="button" onClick={onMore} className={tabClass(false)}>
        <LayoutGrid className="size-5" strokeWidth={1.8} />
        More
      </button>
    </nav>
  );
}
