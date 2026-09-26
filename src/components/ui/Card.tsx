import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('rounded-card border border-line bg-surface p-4.5', className)} {...props} />
  );
}

interface CardHeaderProps {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, action, className }: CardHeaderProps) {
  return (
    <div className={cn('mb-2.5 flex items-center justify-between gap-3', className)}>
      <h3 className="text-base font-semibold">{title}</h3>
      {action}
    </div>
  );
}
