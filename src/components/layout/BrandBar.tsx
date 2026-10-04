import { useState } from 'react';
import { Link } from 'react-router';
import type { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo, buttonClass } from '@/components/ui';
import { cn } from '@/lib/cn';
import { paths } from './navigation';

/** Same left edge as the dashboard lockup: tight, vertically centred. */
export const brandBarClass =
  'flex h-[72px] w-full items-center justify-between gap-3 px-4 md:gap-4 md:px-6 lg:px-8';

const marketingLinks = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Loans', href: '#loans' },
  { label: 'Savings', href: '#savings' },
] as const;

function MarketingNavLinks({
  onDark,
  onNavigate,
  className,
}: {
  onDark?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav aria-label="Website" className={className}>
      {marketingLinks.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            'py-2.5 font-medium whitespace-nowrap transition-colors md:py-0',
            onDark ? 'text-white/85 hover:text-white' : 'text-brand hover:text-primary-text',
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={cn('relative', brandBarClass, className)}>
      <Link to={homeTo} aria-label="RoyalBlue home" className="shrink-0 self-center">
        <Logo onDark={onDark} />
      </Link>
      {showMarketingNav && (
        <MarketingNavLinks
          onDark={onDark}
          className="mx-3 hidden min-w-0 flex-1 items-center justify-end gap-7 self-center text-[15px] md:flex lg:gap-8"
        />
      )}
      <div className="ml-auto flex shrink-0 items-center gap-1.5 self-center md:ml-0 md:gap-2">
        {showMarketingNav ? (
          <button
            type="button"
            className={cn(
              'grid size-10 place-items-center rounded-field md:hidden',
              onDark ? 'text-white hover:bg-white/10' : 'text-brand hover:bg-surface-2',
            )}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="size-5" strokeWidth={1.8} /> : <Menu className="size-5" strokeWidth={1.8} />}
          </button>
        ) : null}
        {trailing}
      </div>
      {showMarketingNav && menuOpen ? (
        <MarketingNavLinks
          onDark={onDark}
          onNavigate={() => setMenuOpen(false)}
          className={cn(
            'absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-t px-4 py-3 text-[15px] md:hidden',
            onDark ? 'border-white/10 bg-[#1b194e]' : 'border-line bg-surface',
          )}
        />
      ) : null}
    </div>
  );
}

export function MarketingAuthButtons({ onDark }: { onDark?: boolean }) {
  return (
    <>
      <LoginButton onDark={onDark} />
      <span className="hidden sm:inline">
        <OpenAccountButton onDark={onDark} />
      </span>
    </>
  );
}

export function LoginButton({ onDark }: { onDark?: boolean }) {
  return (
    <Link
      to={paths.login}
      className={buttonClass({
        size: 'md',
        variant: onDark ? 'glass' : 'outline',
      })}
    >
      Login
    </Link>
  );
}

export function OpenAccountButton({ onDark: _onDark }: { onDark?: boolean }) {
  return (
    <Link
      to={paths.signUp}
      className={buttonClass({
        size: 'md',
        variant: 'primary',
      })}
    >
      Open an account
    </Link>
  );
}
