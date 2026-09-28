import { cn } from '@/lib/cn';

/** Red light streaks rising from the bottom of navy panels (Figma hero / auth background). */
export function Streaks({ className }: { className?: string }) {
  const lines = [
    [14, -8, 30],
    [36, 22, 60],
    [60, 52, 95],
    [84, 80, 130],
    [108, 108, 160],
    [292, 292, 160],
    [316, 320, 130],
    [340, 348, 95],
    [364, 378, 60],
    [386, 408, 30],
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 200"
      preserveAspectRatio="none"
      className={cn(
        'pointer-events-none absolute inset-x-0 bottom-0 h-[55%] w-full opacity-50',
        className,
      )}
    >
      <g stroke="#C93C38" strokeWidth="1.6" strokeLinecap="round" fill="none">
        {lines.map(([x1, x2, y2]) => (
          <path key={x1} d={`M${x1} 200 ${x2} ${y2}`} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
