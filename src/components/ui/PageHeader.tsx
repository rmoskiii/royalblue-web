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
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[30px] leading-tight font-semibold tracking-tight text-brand">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-[13px] text-ink-3">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
