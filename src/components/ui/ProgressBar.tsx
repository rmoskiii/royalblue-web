import { cn } from '@/lib/cn';

export function ProgressBar({
  value,
  label,
  className,
}: {
  /** 0–1 */
  value: number;
  label: string;
  className?: string;
}) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('h-2 overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div
        className="h-full rounded-full bg-primary transition-[width]"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
