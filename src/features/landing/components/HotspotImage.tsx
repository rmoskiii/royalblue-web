import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import { type Anchor, DESIGN_WIDTH, type Hotspot } from '../sections';

const pct = (value: number, of: number) => `${(value / of) * 100}%`;

/**
 * How wide the image is drawn: its share of the page, which is capped at 1440px.
 * Lets the browser pick the 1x, 2x or 3x file before layout.
 */
const sizesFor = (width: number) =>
  `(min-width: ${DESIGN_WIDTH}px) ${width}px, ${(width / DESIGN_WIDTH) * 100}vw`;

/**
 * An image with invisible, keyboard-focusable links placed over the buttons
 * and links it shows. Positions are percentages, so they stay aligned at any size.
 */
export function HotspotImage({
  srcSet,
  alt,
  width,
  height,
  hotspots = [],
  anchors = [],
  eager,
}: {
  /** From an '…&as=srcset' import */
  srcSet: string;
  alt: string;
  width: number;
  height: number;
  hotspots?: Hotspot[];
  anchors?: Anchor[];
  /** Load immediately (above the fold) instead of lazily */
  eager?: boolean;
}) {
  return (
    <div className="relative">
      <img
        // Smallest (1x) file as the fallback; srcSet does the real work
        src={srcSet.split(' ')[0]}
        srcSet={srcSet}
        sizes={sizesFor(width)}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="block h-auto w-full select-none"
        draggable={false}
      />
      {anchors.map((a) => (
        <span
          key={a.id}
          id={a.id}
          aria-hidden
          className="absolute left-0 scroll-mt-[72px]"
          style={{ top: pct(a.y, height) }}
        />
      ))}
      {hotspots.map((h) => {
        const painted = Boolean(h.cover);
        const className = cn(
          'absolute outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary',
          painted &&
            'inline-flex items-center justify-center rounded-full text-[13px] font-medium leading-none',
          h.cover === 'primary' && 'bg-[#c93c38] text-white hover:brightness-110',
          h.cover === 'outline' && 'border border-white/40 bg-[#2f1d4b] text-white hover:bg-white/10',
          !painted && h.shape === 'button' && 'rounded-[10px] hover:bg-white/15',
          !painted && h.shape !== 'button' && 'rounded-md hover:bg-current/10',
        );
        const style = {
          left: pct(h.x, width),
          top: pct(h.y, height),
          width: pct(h.w, width),
          height: pct(h.h, height),
        };
        const label = painted ? h.label : undefined;
        return h.to ? (
          <Link key={h.label} to={h.to} aria-label={h.label} className={className} style={style}>
            {label}
          </Link>
        ) : (
          <a key={h.label} href={h.href} aria-label={h.label} className={className} style={style}>
            {label}
          </a>
        );
      })}
    </div>
  );
}
