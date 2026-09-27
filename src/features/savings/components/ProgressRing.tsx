import type { CSSProperties, ReactNode } from 'react';

const SIZE = 88;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Goal progress ring that draws in on mount (PRD View 4). */
export function ProgressRing({
  value,
  label,
  children,
}: {
  /** 0–1 */
  value: number;
  label: string;
  children?: ReactNode;
}) {
  const pct = Math.min(Math.max(value, 0), 1);
  return (
    <div
      role="img"
      aria-label={`${label}: ${Math.round(pct * 100)}%`}
      className="relative grid size-22 shrink-0 place-items-center"
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0 size-full -rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-surface-3"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - pct)}
          style={{ '--ring-circumference': CIRCUMFERENCE } as CSSProperties}
          className="animate-ring stroke-brand"
        />
      </svg>
      <span className="relative text-center">{children}</span>
    </div>
  );
}
