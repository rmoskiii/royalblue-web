import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-surface-2', className)} aria-hidden />;
}

/** Placeholder block while a dashboard section fetches. */
export function SectionLoader({
  label = 'Loading',
  rows = 3,
}: {
  label?: string;
  rows?: number;
}) {
  return (
    <div className="grid gap-3" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={i === 0 ? 'h-24' : 'h-16'} />
      ))}
    </div>
  );
}
