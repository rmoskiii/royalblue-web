import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Rounded square with a tinted background, used for services and list icons. */
export function IconTile({
  icon: Icon,
  className,
  iconClassName,
}: {
  icon: LucideIcon;
  /** Set colour with a text-* class; the background is a 13% tint of it. */
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        'relative grid size-10 shrink-0 place-items-center rounded-xl before:absolute before:inset-0 before:rounded-[inherit] before:bg-current before:opacity-13',
        className,
      )}
    >
      <Icon className={cn('relative size-5', iconClassName)} strokeWidth={1.8} />
    </span>
  );
}
