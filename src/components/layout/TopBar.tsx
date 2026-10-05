import { Bell, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useAccount, useMe } from '@/api/hooks';
import { isStaffRole } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProfile } from '@/app/providers/ProfileProvider';
import { useToast } from '@/app/providers/ToastProvider';
import { Chip } from '@/components/ui';
import { staffRoleLabel } from '@/features/admin/staffAccess';
import { formatGreetingDate, greeting } from '@/lib/format';
import { paths } from './navigation';
import { PosStatusPill } from './PosStatusPill';
import { ProfileSwitcher } from './ProfileSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  const { data: user } = useMe();
  const { data: account } = useAccount();
  const { session } = useAuth();
  const { showToast } = useToast();
  const { profile, profileType } = useProfile();
  const hello = greeting();
  const staff = isStaffRole(session?.user.role);
  const greetName = staff
    ? (user?.firstName ?? session?.user.email ?? 'there')
    : profileType === 'business'
      ? (profile?.name ?? user?.businessName ?? user?.firstName ?? ' ')
      : (user?.firstName ?? profile?.name ?? ' ');

  return (
    <header className="flex items-center gap-2 border-b border-line bg-surface px-3 py-2 pt-[calc(env(safe-area-inset-top)+0.5rem)] lg:gap-3 lg:px-7 lg:py-3.5 lg:pt-3.5">
      {/* Phones: avatar opens the profile switcher */}
      <div className="lg:hidden">{staff ? null : <ProfileSwitcher />}</div>

      <div className="min-w-0 flex-1 lg:flex-none">
        {/* Phone: small greeting over the name. Desktop: one line plus the date. */}
        <p className="truncate text-xs text-ink-3 lg:hidden">{hello}</p>
        <p className="truncate text-[15px] font-semibold">
          <span className="hidden lg:inline">{hello}, </span>
          {greetName}
        </p>
        <p className="hidden text-xs text-ink-3 lg:block">{formatGreetingDate()}</p>
      </div>

      <div className="ml-3 hidden items-center gap-2 lg:flex">
        {staff && isStaffRole(session?.user.role) ? (
          <Chip>{staffRoleLabel[session.user.role]}</Chip>
        ) : (
          <ProfileSwitcher />
        )}
        {profileType === 'business' && !staff && <PosStatusPill />}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-0.5 lg:gap-1.5">
        <label className="mr-2 hidden h-9.5 w-64 items-center gap-2 rounded-field bg-surface-2 px-3 text-ink-3 2xl:flex">
          <Search className="size-4" />
          <input
            placeholder={staff ? 'Search applications' : 'Search transactions or people'}
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
        </label>
        {account && !staff && (
          <Link
            to={paths.verification}
            title="See your limits and upgrade"
            className="mr-1 inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-primary-soft px-2 text-[11px] font-bold tracking-wider whitespace-nowrap text-primary-text uppercase hover:brightness-95 sm:px-2.5"
          >
            <ShieldCheck className="size-3.5" />
            {account.restrictedNoBvn ? (
              'Starter · ₦50k'
            ) : (
              <>
                <span className="sr-only sm:not-sr-only">Tier </span>
                {account.tier}
              </>
            )}
          </Link>
        )}
        <button
          type="button"
          aria-label="Notifications"
          onClick={() => showToast('Notifications are coming soon')}
          className="relative grid size-9.5 place-items-center rounded-field text-ink-2 hover:bg-surface-2"
        >
          <Bell className="size-5" strokeWidth={1.8} />
          <span className="absolute top-2 right-2.5 size-1.75 rounded-full border-[1.5px] border-surface bg-primary" />
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
