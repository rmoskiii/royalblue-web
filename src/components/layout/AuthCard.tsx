import type { ReactNode } from 'react';

/** White card used by every auth screen (Figma: 26px radius, 24px padding). */
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid w-[min(420px,100%)] gap-4.5 rounded-panel bg-surface p-6 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]">
      <div>
        <h1 className="font-display text-[34px] leading-tight font-medium tracking-tight text-brand">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
