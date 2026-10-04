import { BrandBar, LoginButton, OpenAccountButton } from '@/components/layout/BrandBar';
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
 * one piece, with invisible links over the drawn buttons and nav items.
 * To change a link or add one, edit sections.ts.
 */
export function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-clip bg-white" style={{ colorScheme: 'light' }}>
      <StickyHeader />
      <main>
        {sections.map((s, i) => {
          const frameWidth = `min(${(s.width / DESIGN_WIDTH) * 100}%, ${s.width}px)`;
          const crop = s.visibleHeight;
          return (
            <section
              key={s.srcSet}
              className="relative w-full"
              style={{ background: s.background, marginTop: scaled(s.gapAbove) }}
            >
              {i === 0 && (
                <>
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 z-10 h-[72px] bg-[#1b194e]"
                  />
                  <BrandBar
                    onDark
                    showMarketingNav
                    className="pointer-events-auto absolute inset-x-0 top-0 z-20"
                    trailing={
                      <>
                        <LoginButton onDark />
                        <span className="hidden sm:inline">
                          <OpenAccountButton onDark />
                        </span>
                      </>
                    }
                  />
                </>
              )}
              <div
                id={s.id}
                className="relative mx-auto scroll-mt-[72px] overflow-hidden"
                style={{
                  width: frameWidth,
                  ...(crop
                    ? { aspectRatio: `${s.width} / ${crop}` }
                    : undefined),
                }}
              >
                <div
                  className={crop ? 'absolute inset-x-0 top-0 w-full' : undefined}
                  style={crop ? { aspectRatio: `${s.width} / ${s.height}` } : undefined}
                >
                  <HotspotImage
                    srcSet={s.srcSet}
                    alt={s.alt}
                    width={s.width}
                    height={s.height}
                    hotspots={s.hotspots}
                    anchors={s.anchors}
                    eager={i === 0}
                  />
                </div>
              </div>
              {i === 0 && (
                <div className="relative z-20 flex justify-center px-4 pt-2 pb-10 sm:pt-3 sm:pb-14">
                  <div className="flex w-full max-w-[440px] flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
                    <OpenAccountButton onDark />
                    <LoginButton onDark />
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}
