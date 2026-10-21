import type { ReactNode } from 'react';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-full">
        <h1 className="text-[24px] leading-tight font-semibold tracking-tight break-words text-brand sm:text-[28px] lg:text-[30px]">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] break-words text-ink-3">{subtitle}</p>}
      </div>
      {action ? <div className="w-full min-w-0 shrink-0 sm:w-auto">{action}</div> : null}
    </div>
  );
}
