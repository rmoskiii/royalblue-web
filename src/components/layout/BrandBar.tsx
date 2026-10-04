import { Link } from 'react-router';
import type { ReactNode } from 'react';
import { Logo, buttonClass } from '@/components/ui';
import { cn } from '@/lib/cn';
import { paths } from './navigation';

/** Same left edge as the dashboard lockup: tight, vertically centred. */
export const brandBarClass =
  'flex h-[72px] w-full items-center justify-between gap-4 px-5 md:px-6 lg:px-8';

const marketingLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Loans', href: '#loans' },
  { label: 'Savings', href: '#savings' },
] as const;

export function BrandBar({
  onDark,
  homeTo = paths.welcome,
  trailing,
  showMarketingNav,
  className,
}: {
  onDark?: boolean;
  homeTo?: string;
  trailing?: ReactNode;
  showMarketingNav?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(brandBarClass, className)}>
      <Link to={homeTo} aria-label="RoyalBlue home" className="shrink-0 self-center">
        <Logo onDark={onDark} />
      </Link>
      {showMarketingNav && (
        <nav
          aria-label="Website"
          className="mx-3 hidden min-w-0 flex-1 items-center justify-end gap-4 self-center overflow-x-auto text-[15px] font-medium sm:flex md:gap-7 lg:gap-8"
        >
          {marketingLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'text-[15px] font-medium whitespace-nowrap transition-colors',
                onDark ? 'text-white/85 hover:text-white' : 'text-brand hover:text-primary-text',
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      )}
      {trailing ? <div className="ml-auto flex shrink-0 items-center gap-2 self-center sm:ml-0">{trailing}</div> : null}
    </div>
  );
}

export function LoginButton({ onDark }: { onDark?: boolean }) {
  return (
    <Link
      to={paths.login}
      className={buttonClass({
        size: 'sm',
        variant: onDark ? 'glass' : 'outline',
        className: 'min-w-[4.75rem] px-3.5 text-[13px]',
      })}
    >
      Login
    </Link>
  );
}

export function OpenAccountButton({ onDark }: { onDark?: boolean }) {
  return (
    <Link
      to={paths.signUp}
      className={buttonClass({
        size: 'sm',
        variant: 'primary',
        className: 'min-w-[8.25rem] px-3.5 text-[13px]',
      })}
    >
      Open an account
    </Link>
  );
}
