import { Link, Outlet } from 'react-router';
import { Logo, buttonClass } from '@/components/ui';
import { paths } from './navigation';
import { ThemeToggle } from './ThemeToggle';

/** Navy background with red light streaks, as in the Figma auth screens. */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-navy bg-[linear-gradient(180deg,rgb(201_60_56/0)_40%,rgb(201_60_56)_256%)]">
      <Streaks />
      <header className="relative flex flex-wrap items-center justify-between gap-3 px-5 pt-[max(20px,env(safe-area-inset-top))] pb-5 md:px-12 md:pt-8">
        <Link to={paths.login} aria-label="RoyalBlue home">
          <Logo onDark />
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

function Streaks() {
  const lines = [
    [14, -8, 30],
    [36, 22, 60],
    [60, 52, 95],
    [84, 80, 130],
    [108, 108, 160],
    [292, 292, 160],
    [316, 320, 130],
    [340, 348, 95],
    [364, 378, 60],
    [386, 408, 30],
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full opacity-50"
    >
      <g stroke="#C93C38" strokeWidth="1.6" strokeLinecap="round" fill="none">
        {lines.map(([x1, x2, y2]) => (
          <path key={x1} d={`M${x1} 200 ${x2} ${y2}`} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
