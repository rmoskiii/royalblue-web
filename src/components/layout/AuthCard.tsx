import type { ReactNode } from 'react';

/** White card used by every auth screen (Figma: 26px radius, 24px padding). */
export function AuthCard({
  title,
  subtitle,
  step,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  /** e.g. "Step 2 of 5" */
  step?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid w-[min(420px,100%)] gap-4.5 rounded-panel bg-surface p-6 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]">
      <div>
        {step && (
          <p className="mb-1.5 text-xs font-semibold tracking-wider text-ink-3 uppercase">{step}</p>
        )}
        <h1 className="text-[34px] leading-tight font-semibold tracking-tight text-brand">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
