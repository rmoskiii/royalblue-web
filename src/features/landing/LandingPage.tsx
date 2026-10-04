import { BrandBar, MarketingAuthButtons } from '@/components/layout/BrandBar';
import { HeroCtas } from './components/HeroCtas';
import { HotspotImage } from './components/HotspotImage';
import { StickyHeader } from './components/StickyHeader';
import { DESIGN_WIDTH, sections } from './sections';

/** Figma pixels → a length that scales with the page (the design is capped at 1440px wide). */
const scaled = (px: number) => `min(${(px / DESIGN_WIDTH) * 100}%, ${px}px)`;

/**
 * Public marketing site, built from the Figma "Desktop - 2" exports.
 * Lives at /welcome, which is where "/" (the bare site link) redirects.
 *
 * Every section is an image laid out on the 1440px Figma grid and scaled as
 * one piece, with links over the drawn buttons and nav items.
 * To change a link or add one, edit sections.ts.
 */
export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-white" style={{ colorScheme: 'light' }}>
      <StickyHeader />
      <main>
        {sections.map((s, i) => {
          const drawWidth = s.displayWidth ?? s.width;
          const frameWidth = `min(${(drawWidth / DESIGN_WIDTH) * 100}%, ${drawWidth}px)`;
          return (
            <section
              key={s.srcSet}
              className="relative w-full"
              style={{ background: s.background, marginTop: scaled(s.gapAbove) }}
            >
              {i === 0 && (
                <>
                  <div aria-hidden className="absolute inset-x-0 top-0 z-10 h-[72px] bg-[#1b194e]" />
                  <BrandBar
                    onDark
                    showMarketingNav
                    className="pointer-events-auto absolute inset-x-0 top-0 z-20"
                    trailing={<MarketingAuthButtons onDark />}
                  />
                </>
              )}
              <div id={s.id} className="relative mx-auto scroll-mt-[72px]" style={{ width: frameWidth }}>
                <HotspotImage
                  srcSet={s.srcSet}
                  alt={s.alt}
                  width={s.width}
                  height={s.height}
                  hotspots={s.hotspots}
                  anchors={s.anchors}
                  eager={i === 0}
                />
                {i === 0 ? <HeroCtas /> : null}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
