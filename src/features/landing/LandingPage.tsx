import { HotspotImage } from './components/HotspotImage';
import { StickyHeader } from './components/StickyHeader';
import { DESIGN_WIDTH, sections } from './sections';

/** Figma pixels → a length that scales with the page (the design is capped at 1440px wide). */
const scaled = (px: number) => `min(${(px / DESIGN_WIDTH) * 100}%, ${px}px)`;

/**
 * Public marketing site, built from the Figma "Desktop - 2" exports.
 * Shown at "/" to signed-out visitors and at /welcome for everyone.
 *
 * Every section is an image laid out on the 1440px Figma grid and scaled as
 * one piece, with invisible links over the drawn buttons and nav items.
 * To change a link or add one, edit sections.ts.
 */
export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-white" style={{ colorScheme: 'light' }}>
      <StickyHeader />
      <main>
        {sections.map((s, i) => (
          <section
            key={s.src}
            className="w-full"
            style={{ background: s.background, marginTop: scaled(s.gapAbove) }}
          >
            <div
              id={s.id}
              className="mx-auto scroll-mt-[72px]"
              style={{ width: `min(${(s.width / DESIGN_WIDTH) * 100}%, ${s.width}px)` }}
            >
              <HotspotImage
                src={s.src}
                alt={s.alt}
                width={s.width}
                height={s.height}
                hotspots={s.hotspots}
                anchors={s.anchors}
                eager={i === 0}
              />
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
