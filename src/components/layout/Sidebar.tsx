import { ChevronRight, LogOut } from 'lucide-react';
import { Link } from 'react-router';
import { useAccount, useLoans } from '@/api/hooks';
import { isStaffRole } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProfile } from '@/app/providers/ProfileProvider';
import { Avatar, Chip, Logo } from '@/components/ui';
import { staffRoleLabel } from '@/features/admin/staffAccess';
import { cn } from '@/lib/cn';
import { useLogoutConfirm } from './LogoutProvider';
import { NavEntry } from './NavEntry';
import { homePathForRole, paths, settingsNav, type NavItem } from './navigation';
import { useWorkspaceNav } from './useWorkspaceNav';

function SidebarItem({ item, badge }: { item: NavItem; badge?: string }) {
  const Icon = item.icon;
  return (
    <NavEntry
      item={item}
      className={(isActive) =>
        cn(
          'flex w-full items-center gap-3 rounded-field px-2.5 py-2.25 text-left font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white',
          isActive && 'bg-white/12 text-white hover:bg-white/12',
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
    </NavEntry>
  );
}

/** PRD View 1: royal blue sidebar with logo, menu and a profile badge at the bottom. */
export function Sidebar({ className }: { className?: string }) {
  const { data: loans } = useLoans();
  const { data: account } = useAccount();
  const { session } = useAuth();
  const { requestLogout } = useLogoutConfirm();
  const { profile, profileType } = useProfile();
  const nav = useWorkspaceNav();
  const staff = isStaffRole(session?.user.role);
  const hasActiveLoan = !staff && loans?.some((l) => l.status === 'active');
  const profileName = staff
    ? (session?.user.firstName || session?.user.email || 'Staff')
    : (profile?.name ?? '');
  const homeTo = homePathForRole(session?.user.role);

  return (
    <aside
      className={cn(
        'w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-white/5 bg-navy px-3 py-4.5',
        className,
      )}
    >
      <Link to={homeTo} aria-label="RoyalBlue home" className="mx-2.5 mt-1 mb-5 flex items-center self-start">
        <Logo onDark />
      </Link>
      <nav aria-label="Main" className="grid gap-0.5">
        {nav.primary.map((item) => (
          <SidebarItem
            key={item.label}
            item={item}
            badge={item.to === paths.loans && hasActiveLoan ? 'Active' : undefined}
          />
        ))}
      </nav>

      <div className="mt-auto" />
      {nav.learnAndEarn.length > 0 && (
        <>
          <p className="px-2.5 pt-4.5 pb-1.5 text-[11px] font-semibold tracking-wider text-white/45 uppercase">
            Learn and earn
          </p>
          <nav aria-label="Learn and earn" className="grid gap-0.5">
            {nav.learnAndEarn.map((item) => (
              <SidebarItem key={item.label} item={item} />
            ))}
          </nav>
        </>
      )}

      <div className="mt-3 border-t border-white/10 pt-3">
        <SidebarItem item={settingsNav} />
        <Link
          to={paths.settings}
          className="mt-2 flex items-center gap-2.5 rounded-xl bg-white/8 p-2.5 text-white hover:bg-white/12"
        >
          <Avatar name={profileName || ' '} className="bg-white/15 text-white" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold">{profileName}</span>
            <span className="block text-xs text-white/60">
              {staff && isStaffRole(session?.user.role)
                ? staffRoleLabel[session.user.role]
                : `${profileType === 'business' ? 'Business' : 'Personal'}${account ? ` · Tier ${account.tier}` : ''}`}
            </span>
          </span>
          <ChevronRight className="size-4 text-white/50" />
        </Link>
        <button
          type="button"
          onClick={requestLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-field px-2.5 py-2.25 text-left font-medium text-white/70 transition-colors hover:bg-white/8 hover:text-white"
        >
          <LogOut className="size-5" strokeWidth={1.8} />
          Log out
        </button>
      </div>
    </aside>
  );
}
