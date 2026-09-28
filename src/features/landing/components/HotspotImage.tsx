import { Link } from 'react-router';
import { cn } from '@/lib/cn';
import type { Anchor, Hotspot } from '../sections';

const pct = (value: number, of: number) => `${(value / of) * 100}%`;

/**
 * An image with invisible, keyboard-focusable links placed over the buttons
 * and links it shows. Positions are percentages, so they stay aligned at any size.
 */
export function HotspotImage({
  src,
  alt,
  width,
  height,
  hotspots = [],
  anchors = [],
  eager,
}: {
  src: string;
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
        src={src}
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
        const className = cn(
          'absolute outline-offset-2 transition-colors focus-visible:outline-2 focus-visible:outline-primary',
          h.shape === 'button'
            ? 'rounded-[10px] hover:bg-white/15'
            : 'rounded-md hover:bg-current/10',
        );
        const style = {
          left: pct(h.x, width),
          top: pct(h.y, height),
          width: pct(h.w, width),
          height: pct(h.h, height),
        };
        return h.to ? (
          <Link key={h.label} to={h.to} aria-label={h.label} className={className} style={style} />
        ) : (
          <a key={h.label} href={h.href} aria-label={h.label} className={className} style={style} />
        );
      })}
    </div>
  );
}
