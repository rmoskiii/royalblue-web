import { Link, Outlet } from 'react-router';
import { Logo, Streaks, buttonClass } from '@/components/ui';
import { paths } from './navigation';
import { ThemeToggle } from './ThemeToggle';

/** Navy background with red light streaks, as in the Figma auth screens. */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-navy bg-[linear-gradient(180deg,rgb(201_60_56/0)_40%,rgb(201_60_56)_256%)]">
      <Streaks />
      <header className="relative flex flex-wrap items-center justify-between gap-3 px-5 pt-[max(20px,env(safe-area-inset-top))] pb-5 md:px-12 md:pt-8">
        <Link to={paths.home} aria-label="RoyalBlue home">
          <Logo onDark className="h-8 md:h-12" />
        </Link>
        <div className="flex items-center gap-2.5">
          <ThemeToggle onDark />
          <Link to={paths.signUp} className={buttonClass({ size: 'sm' })}>
            Open an account
          </Link>
        </div>
      </header>
      <main className="relative grid flex-1 place-items-center px-4 py-6">
        <Outlet />
      </main>
      <footer className="relative p-4 text-center text-xs text-white/60">
        Licensed by the Central Bank of Nigeria · Deposits insured by NDIC
      </footer>
    </div>
  );
}
