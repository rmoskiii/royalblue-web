import { Delete, Fingerprint } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Transaction PIN pad. Works with taps and the physical keyboard.
 * Calls onComplete as soon as every digit is entered.
 */
export function PinPad({
  value,
  onChange,
  onComplete,
  onBiometric,
  disabled,
  length = 4,
  largeOnMobile = false,
}: {
  value: string;
  onChange: (pin: string) => void;
  onComplete: (pin: string) => void;
  onBiometric?: () => void;
  disabled?: boolean;
  length?: 4 | 6;
  /** Bigger keys below `lg`. Desktop pad size is unchanged. */
  largeOnMobile?: boolean;
}) {
  const press = (digit: string) => {
    if (disabled || value.length >= length) return;
    const next = value + digit;
    onChange(next);
    if (next.length === length) onComplete(next);
  };
  const erase = () => !disabled && onChange(value.slice(0, -1));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') erase();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const keyClass = largeOnMobile
    ? 'grid h-16 place-items-center rounded-2xl text-2xl font-semibold transition hover:bg-surface-2 active:bg-surface-3 disabled:opacity-40 lg:h-12 lg:text-xl'
    : 'grid h-11 place-items-center rounded-xl text-lg font-semibold transition hover:bg-surface-2 active:bg-surface-3 disabled:opacity-40 sm:h-12 sm:rounded-2xl sm:text-xl';

  return (
    <div className="grid justify-items-center gap-4">
      <div
        className="flex gap-3"
        aria-label={`${value.length} of ${length} digits entered`}
        role="status"
      >
        {Array.from({ length }, (_, i) => (
          <span
            key={i}
            className={cn(
              'size-3 rounded-full border-2 border-ink-3 transition',
              largeOnMobile && 'max-lg:size-3.5',
              i < value.length && 'border-brand bg-brand',
            )}
          />
        ))}
      </div>

      <div
        className={cn(
          'grid w-full grid-cols-3 gap-1.5',
          largeOnMobile ? 'max-w-[320px] gap-2 lg:max-w-[240px] lg:gap-1.5' : 'max-w-[240px]',
        )}
      >
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            disabled={disabled}
            className={keyClass}
            onClick={() => press(k)}
          >
            {k}
          </button>
        ))}
        {onBiometric ? (
          <button
            type="button"
            aria-label="Use fingerprint or face"
            disabled={disabled}
            className={cn(keyClass, 'text-brand')}
            onClick={onBiometric}
          >
            <Fingerprint className="size-6" />
          </button>
        ) : (
          <span />
        )}
        <button type="button" disabled={disabled} className={keyClass} onClick={() => press('0')}>
          0
        </button>
        <button
          type="button"
          aria-label="Delete"
          disabled={disabled}
          className={keyClass}
          onClick={erase}
        >
          <Delete className="size-6" />
        </button>
      </div>
    </div>
  );
}
