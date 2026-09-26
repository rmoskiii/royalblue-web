import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { cn } from '@/lib/cn';

/** Two-state light/dark switch used in the top bar and on auth screens. */
export function ThemeToggle({ onDark, className }: { onDark?: boolean; className?: string }) {
  const { theme, setTheme } = useTheme();
  const options = [
    { value: 'light', label: 'Light mode', icon: Sun },
    { value: 'dark', label: 'Dark mode', icon: Moon },
  ] as const;

  return (
    <div
      role="group"
      aria-label="Theme"
      className={cn(
        'flex shrink-0 gap-0.5 rounded-full p-[3px]',
        onDark ? 'bg-white/12' : 'bg-surface-2',
        className,
      )}
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'grid size-7.5 place-items-center rounded-full transition',
            onDark
              ? 'text-white/70 aria-pressed:bg-white/22 aria-pressed:text-white'
              : 'text-ink-3 aria-pressed:bg-switch-on aria-pressed:text-ink aria-pressed:shadow-sm',
          )}
        >
          <Icon className="size-4" />
        </button>
      ))}
    </div>
  );
}
