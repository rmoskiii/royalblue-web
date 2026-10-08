import { BrandBar, LoginButton, OpenAccountButton } from '@/components/layout/BrandBar';
import { Streaks } from '@/components/ui';
import { Outlet, useLocation } from 'react-router';
import { paths } from './navigation';

/** Navy background with red light streaks, as in the Figma auth screens. */
export function AuthLayout() {
  const pathname = useLocation().pathname;
  const showLogin = pathname === paths.signUp || pathname === paths.forgot;
  return (
    <div className="relative flex min-h-dvh flex-col bg-navy">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Streaks />
      </div>
      <header className="relative pt-[max(0px,env(safe-area-inset-top))]">
        <BrandBar
          onDark
          homeTo={paths.welcome}
          trailing={showLogin ? <LoginButton onDark /> : <OpenAccountButton onDark />}
        />
      </header>
      <main className="relative grid flex-1 place-items-center px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
