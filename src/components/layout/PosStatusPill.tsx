import { useBusinessSummary } from '@/api/hooks';
import { cn } from '@/lib/cn';

/** "● 2 POS online" (PRD View 2). Green with a pulse while any terminal is online. */
export function PosStatusPill({ className }: { className?: string }) {
  const { data } = useBusinessSummary();
  if (!data) return null;
  const online = data.terminalsOnline > 0;

  return (
    <span
      className={cn(
        'inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold',
        online ? 'bg-success-soft text-success' : 'bg-surface-3 text-ink-2',
        className,
      )}
    >
      <span className="relative flex size-2">
        {online && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
        )}
        <span
          className={cn(
            'relative inline-flex size-2 rounded-full',
            online ? 'bg-success' : 'bg-ink-3',
          )}
        />
      </span>
      {data.terminalsOnline} POS online
    </span>
  );
}
