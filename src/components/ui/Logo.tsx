import { cn } from '@/lib/cn';

/**
 * Text wordmark approximating the RoyalBlue lockup.
 * TODO: replace with the official SVG export from Figma (node 41:10375) in src/assets/.
 */
export function Logo({ onDark, className }: { onDark?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        'relative inline-block pt-1 font-display text-2xl leading-none font-medium tracking-tight',
        onDark ? 'text-white' : 'text-brand',
        className,
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 14"
        className="absolute -top-0.5 left-0.5 h-[7px] w-[11px]"
        fill="#C93C38"
      >
        <path d="M2 13 3.5 3 8 7.5 12 1.5 16 7.5 20.5 3 22 13Z" />
      </svg>
      RoyalBlue
    </span>
  );
}
