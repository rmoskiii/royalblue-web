import { useId, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, options, id, className, ...props }: SelectFieldProps) {
  const autoId = useId();
  const selectId = id ?? autoId;
  return (
    <div className={cn('grid gap-1.5', className)}>
      <label htmlFor={selectId} className="text-[13px] font-medium text-ink-2">
        {label}
      </label>
      <div className="relative">
        <select
          id={selectId}
          className="h-12 w-full appearance-none rounded-field border border-transparent bg-surface-2 pr-10 pl-3.5 text-[15px] text-ink outline-none focus:border-brand focus:ring-3 focus:ring-brand/15"
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-ink-3" />
      </div>
    </div>
  );
}
