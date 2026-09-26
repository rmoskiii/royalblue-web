import { NavLink } from 'react-router';
import { useLoans } from '@/api/hooks';
import { Chip, Logo } from '@/components/ui';
import { cn } from '@/lib/cn';
import { learnAndEarnNav, paths, primaryNav, type NavItem } from './navigation';

function SidebarLink({ item, badge }: { item: NavItem; badge?: string }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === paths.home}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-field px-2.5 py-2.25 font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink',
          isActive &&
            'bg-primary-soft text-primary-text hover:bg-primary-soft hover:text-primary-text',
        )
      }
    >
      <Icon className="size-5" strokeWidth={1.8} />
      {item.label}
      {badge && (
        <Chip tone="success" className="ml-auto">
          {badge}
        </Chip>
      )}
    </NavLink>
  );
}

export function Sidebar({ className }: { className?: string }) {
  const { data: loans } = useLoans();
  const hasActiveLoan = loans?.some((l) => l.status === 'active');

  return (
    <aside
      className={cn(
        'w-59 shrink-0 flex-col gap-1 overflow-y-auto border-r border-line bg-surface px-3 py-4.5',
        className,
      )}
    >
      <Logo className="mx-2.5 mt-1 mb-4.5 self-start" />
      <nav aria-label="Main" className="grid gap-1">
        {primaryNav.map((item) => (
          <SidebarLink
            key={item.to}
            item={item}
            badge={item.to === paths.loans && hasActiveLoan ? 'Active' : undefined}
          />
        ))}
      </nav>

      <div className="mt-auto" />
      <p className="px-2.5 pt-4.5 pb-1.5 text-[11px] font-semibold tracking-wider text-ink-3 uppercase">
        Learn and earn
      </p>
      <nav aria-label="Learn and earn" className="grid gap-1">
        {learnAndEarnNav.map((item) => (
          <SidebarLink key={item.to} item={item} />
        ))}
      </nav>
      <p className="mt-3.5 rounded-xl bg-surface-2 p-3 text-xs leading-snug text-ink-3">
        Licensed by the Central Bank of Nigeria. Deposits insured by NDIC.
      </p>
    </aside>
  );
}
