import { Bell, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { useAccount, useMe } from '@/api/hooks';
import { useToast } from '@/app/providers/ToastProvider';
import { Avatar } from '@/components/ui';
import { formatGreetingDate, greeting } from '@/lib/format';
import { paths } from './navigation';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  const { data: user } = useMe();
  const { data: account } = useAccount();
  const { showToast } = useToast();
  const fullName = user ? `${user.firstName} ${user.lastName}` : '';
  const hello = greeting();

  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3 pt-[max(12px,env(safe-area-inset-top))] lg:px-7 lg:py-3.5">
      <Avatar name={fullName || ' '} className="lg:hidden" />

      <div className="min-w-0">
        {/* Phone: small greeting over the name. Desktop: one line plus the date. */}
        <p className="text-xs text-ink-3 lg:hidden">{hello}</p>
        <p className="truncate text-[15px] font-semibold">
          <span className="hidden lg:inline">{hello}, </span>
          {user?.firstName ?? ' '}
        </p>
        <p className="hidden text-xs text-ink-3 lg:block">{formatGreetingDate()}</p>
      </div>

      <div className="ml-auto flex items-center gap-0.5 lg:gap-1.5">
        <label className="mr-2 hidden h-9.5 w-75 items-center gap-2 rounded-field bg-surface-2 px-3 text-ink-3 xl:flex">
          <Search className="size-4" />
          <input
            placeholder="Search transactions or people"
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
        </label>
        {account && (
          <Link
            to={paths.verification}
            title="See your limits and upgrade"
            className="mr-1 inline-flex h-7 items-center gap-1 rounded-full bg-primary-soft px-2.5 text-[11px] font-bold tracking-wider text-primary-text uppercase hover:brightness-95"
          >
            <ShieldCheck className="size-3.5" />
            Tier {account.tier}
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
