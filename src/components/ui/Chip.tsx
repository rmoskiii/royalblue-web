import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'onDark';

const tones: Record<Tone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-primary-soft text-primary-text',
  neutral: 'bg-surface-3 text-ink-2',
  onDark: 'bg-white/15 text-white',
};

export function Chip({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-5.5 items-center gap-1 rounded-full px-2 text-[11px] font-semibold whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
