import { LayoutGrid } from 'lucide-react';
import { NavLink } from 'react-router';
import { cn } from '@/lib/cn';
import { mobileTabs, paths } from './navigation';

const tabClass =
  'flex flex-col items-center gap-0.75 py-1.5 text-[11px] font-medium text-ink-3 aria-[current=page]:text-primary-text';

export function BottomTabs({ onMore, className }: { onMore: () => void; className?: string }) {
  return (
    <nav
      aria-label="Main"
      className={cn(
        'grid grid-cols-5 border-t border-line bg-surface px-1 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))]',
        className,
      )}
    >
      {mobileTabs.map(({ label, to, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === paths.home} className={tabClass}>
          <Icon className="size-5" strokeWidth={1.8} />
          {label}
        </NavLink>
      ))}
      <button type="button" onClick={onMore} className={tabClass}>
        <LayoutGrid className="size-5" strokeWidth={1.8} />
        More
      </button>
    </nav>
  );
}
