import { LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/cn';
import { NavEntry } from './NavEntry';
import { useWorkspaceNav } from './useWorkspaceNav';

const tabClass = (isActive: boolean) =>
  cn(
    'flex flex-col items-center gap-0 py-1 text-[11px] font-medium text-ink-3',
    isActive && 'text-primary-text',
  );

/** Phone navigation for the active profile, plus More. */
export function BottomTabs({ onMore, className }: { onMore: () => void; className?: string }) {
  const { mobileTabs } = useWorkspaceNav();
  const cols = mobileTabs.length + 1;
  return (
    <nav
      aria-label="Main"
      className={cn(
        'grid border-t border-line bg-surface px-1 pt-0.5 pb-[max(4px,env(safe-area-inset-bottom))]',
        cols === 3 && 'grid-cols-3',
        cols === 4 && 'grid-cols-4',
        cols === 5 && 'grid-cols-5',
        className,
      )}
    >
      {mobileTabs.map((item) => {
        const Icon = item.icon;
        return (
          <NavEntry key={item.label} item={item} className={tabClass}>
            <Icon className="size-4.5" strokeWidth={1.8} />
            {item.label}
          </NavEntry>
        );
      })}
      <button type="button" onClick={onMore} className={tabClass(false)}>
        <LayoutGrid className="size-4.5" strokeWidth={1.8} />
        More
      </button>
    </nav>
  );
}
