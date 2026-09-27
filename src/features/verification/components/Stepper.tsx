import { Check } from 'lucide-react';
import type { VerificationStepId } from '@/api/types';
import { cn } from '@/lib/cn';
import { verificationSteps } from '../stepList';

/** PRD View 6: 3-step progress indicator. Steps are clickable to review or redo. */
export function Stepper({
  completed,
  active,
  onSelect,
}: {
  completed: Set<VerificationStepId>;
  active: VerificationStepId | null;
  onSelect: (id: VerificationStepId) => void;
}) {
  return (
    <ol className="grid grid-cols-3 gap-2">
      {verificationSteps.map((s, i) => {
        const done = completed.has(s.id);
        const isActive = s.id === active;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s.id)}
              aria-current={isActive ? 'step' : undefined}
              className="grid w-full gap-2 text-left"
            >
              <span
                className={cn(
                  'h-1.5 rounded-full bg-surface-3',
                  done && 'bg-success',
                  isActive && !done && 'bg-primary',
                )}
              />
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full border border-line text-[11px] font-semibold',
                    done && 'border-success bg-success text-white',
                    isActive && !done && 'border-primary text-primary-text',
                  )}
                >
                  {done ? <Check className="size-3.5" /> : i + 1}
                </span>
                <span className={cn('text-[13px] font-medium', !isActive && 'text-ink-2')}>
                  {s.label}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
