import { cn } from '@/lib/cn';
import { initials } from '@/lib/format';

export function Avatar({
  name,
  color,
  size = 'md',
  className,
}: {
  name: string;
  /** Background colour; defaults to a neutral surface */
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={color ? { backgroundColor: color } : undefined}
      className={cn(
        'grid shrink-0 place-items-center rounded-full font-semibold',
        color ? 'text-white' : 'bg-surface-3 text-brand',
        size === 'sm' && 'size-8 text-xs',
        size === 'md' && 'size-9 text-[13px]',
        size === 'lg' && 'size-11 text-sm',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
