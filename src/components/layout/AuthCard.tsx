import type { ReactNode } from 'react';

/** White card used by every auth screen (Figma: 26px radius, 24px padding). */
export function AuthCard({
  title,
  subtitle,
  back,
  children,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid w-[min(450px,100%)] gap-6 rounded-[26px] border border-line bg-surface p-6 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]">
      {back}
      <div>
        <h1 className="text-[40px] leading-[1.1] font-semibold tracking-[-0.8px] text-brand">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
