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
    <div className="grid w-full max-w-[450px] gap-4 rounded-[26px] border border-line bg-surface p-4 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] sm:gap-6 sm:p-6">
      {back}
      <div>
        <h1 className="text-[28px] leading-[1.1] font-semibold tracking-[-0.8px] text-brand sm:text-[40px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-ink-3">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
