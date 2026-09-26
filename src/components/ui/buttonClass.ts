import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'glass' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:brightness-110',
  secondary: 'bg-surface-2 text-ink hover:bg-surface-3',
  outline: 'border-current bg-transparent text-brand hover:bg-surface-2',
  glass: 'border-white/15 bg-white/12 text-white hover:bg-white/20',
  ghost: 'bg-transparent text-ink-2 hover:bg-surface-2 hover:text-ink',
  link: 'h-auto px-0 text-primary-text hover:underline',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
};

export interface ButtonStyleProps {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
}

/**
 * Button classes on their own, for links that should look like buttons:
 * <Link to="/loans" className={buttonClass({ variant: 'secondary' })}>…</Link>
 */
export function buttonClass({
  variant = 'primary',
  size = 'md',
  block,
  className,
}: ButtonStyleProps = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-field border border-transparent font-medium whitespace-nowrap transition disabled:cursor-not-allowed disabled:opacity-50',
    sizes[size],
    variants[variant],
    block && 'w-full',
    className,
  );
}
