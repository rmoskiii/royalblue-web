import { cn } from '@/lib/cn';

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  label: string;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('grid auto-cols-fr grid-flow-col rounded-xl bg-surface-2 p-1', className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className="h-9.5 rounded-[9px] font-medium text-ink-2 aria-pressed:bg-surface aria-pressed:text-brand aria-pressed:shadow-sm"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
