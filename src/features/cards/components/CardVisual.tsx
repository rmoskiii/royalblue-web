import { Snowflake, Wifi } from 'lucide-react';
import { useRef, type PointerEvent } from 'react';
import type { Card, CardSecrets } from '@/api/types';
import { cn } from '@/lib/cn';

const schemeName = { visa: 'VISA', mastercard: 'Mastercard', verve: 'Verve' } as const;

/**
 * 3D-styled card (PRD View 5): royal blue matte finish with a silver chip.
 * Tilts gently with the pointer; stays flat with reduced motion.
 */
export function CardVisual({ card, secrets }: { card: Card; secrets?: CardSecrets }) {
  const ref = useRef<HTMLDivElement>(null);

  const tilt = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 12).toFixed(2)}deg)`;
  };
  const reset = () => ref.current && (ref.current.style.transform = '');

  const number = secrets?.pan ?? `•••• •••• •••• ${card.last4}`;

  return (
    <div className="[perspective:900px]" onPointerMove={tilt} onPointerLeave={reset}>
      <div
        ref={ref}
        aria-label={`${card.kind === 'virtual' ? 'Virtual' : 'Physical'} card ending ${card.last4}${card.frozen ? ', frozen' : ''}`}
        role="img"
        className={cn(
          'relative aspect-[1.586] w-full max-w-[400px] overflow-hidden rounded-[18px] p-5 text-white shadow-[0_24px_48px_-20px_rgb(14_13_34/0.6)] transition-[transform,filter] duration-200 ease-out sm:p-6',
          'bg-[radial-gradient(120%_140%_at_0%_0%,#34318a_0%,#1b194d_55%,#120f36_100%)]',
          card.frozen && 'grayscale-[0.8]',
        )}
      >
        {/* Matte grain and a soft sheen */}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgb(255_255_255/0.08)_50%,transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-lg font-semibold tracking-tight">RoyalBlue</span>
            <span className="text-xs font-medium tracking-wider text-white/70 uppercase">
              {card.kind}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Silver chip */}
            <span className="h-8 w-11 rounded-md bg-[linear-gradient(135deg,#f4f4f6,#a9abb4_45%,#e7e8ec_70%,#8d8f99)] shadow-inner" />
            <Wifi className="size-5 rotate-90 text-white/70" />
          </div>

          <div>
            <p className="text-[17px] tracking-[0.14em] tabular sm:text-xl">{number}</p>
            <div className="mt-2 flex items-end justify-between gap-3 text-xs">
              <span className="truncate font-medium tracking-wider">{card.nameOnCard}</span>
              <span className="flex shrink-0 items-center gap-3 text-white/80 tabular">
                <span>{card.expiry}</span>
                <span className="text-base font-bold tracking-tight text-white italic">
                  {schemeName[card.scheme]}
                </span>
              </span>
            </div>
          </div>
        </div>

        {card.frozen && (
          <div className="absolute inset-0 grid place-items-center bg-[#1b194d]/45 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">
              <Snowflake className="size-4" /> Frozen
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
