import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** White card used by every auth screen (Figma: 26px radius, 24px padding). */
export function AuthCard({
  title,
  subtitle,
  back,
  children,
  fillMobile = false,
}: {
  title: string;
  subtitle?: ReactNode;
  back?: ReactNode;
  children: ReactNode;
  /** Phones: stretch toward the viewport. Desktop card size stays 450px. */
  fillMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        'grid w-full max-w-[450px] gap-4 rounded-[26px] border border-line bg-surface p-4 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)] sm:gap-6 sm:p-6',
        fillMobile &&
          'max-lg:max-w-none max-lg:min-h-[min(88dvh,100%)] max-lg:content-between max-lg:gap-6 max-lg:p-5',
      )}
    >
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
