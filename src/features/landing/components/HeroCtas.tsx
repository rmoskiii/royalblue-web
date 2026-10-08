import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';

/** Figma hero CTAs, a little larger, with real padding (not stretched pills). */
const base =
  'inline-flex h-11 items-center justify-center rounded-[10px] px-7 text-[14px] font-medium leading-none whitespace-nowrap transition';

export function HeroCtas() {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-10 flex justify-center"
      style={{ top: '61.8%' }}
    >
      <div className="pointer-events-auto flex items-center gap-2.5">
        <Link
          to={paths.signUp}
          className={`${base} min-w-[10.75rem] bg-[#C93C38] text-white hover:brightness-110`}
        >
          Open an account
        </Link>
        <Link
          to={paths.login}
          className={`${base} min-w-[8.25rem] border border-white/55 bg-[#2f1d4b] text-white hover:bg-white/10`}
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
