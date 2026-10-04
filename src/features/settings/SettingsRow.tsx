import { ChevronRight, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { cn } from '@/lib/cn';

export function SettingsRow({
  to,
  href,
  icon: Icon,
  label,
  value,
  onClick,
}: {
  to?: string;
  href?: string;
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  onClick?: () => void;
}) {
  const inner = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-text">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1 text-left font-medium">{label}</span>
      {value != null && <span className="max-w-[45%] truncate text-[13px] text-ink-3">{value}</span>}
      <ChevronRight className="size-4 shrink-0 text-ink-3" />
    </>
  );
  const className = cn(
    'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2',
  );
  if (to) {
    return (
      <Link to={to} className={className}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {inner}
    </button>
  );
}
