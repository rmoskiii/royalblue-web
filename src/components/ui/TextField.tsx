import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  /** Shown inside the field on the left, e.g. "₦" or "+234" */
  prefix?: ReactNode;
  /** Shown inside the field on the right, e.g. a show-password button */
  suffix?: ReactNode;
  inputClassName?: string;
}

export function TextField({
  label,
  hint,
  error,
  prefix,
  suffix,
  id,
  className,
  inputClassName,
  ...props
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={inputId} className="text-[13px] font-medium text-ink-2">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-medium text-ink-3">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-12 w-full rounded-field border border-transparent bg-surface-2 px-3.5 text-base text-ink outline-none placeholder:text-ink-3',
            'focus:border-brand focus:ring-3 focus:ring-brand/15',
            error && 'border-primary',
            prefix && 'pl-8',
            suffix && 'pr-12',
            inputClassName,
          )}
          {...props}
        />
        {suffix && <span className="absolute top-1/2 right-1.5 -translate-y-1/2">{suffix}</span>}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-primary-text">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
