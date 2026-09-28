# Assets

Imported from code (`import img from '@/assets/...'`), so Vite fingerprints and optimises them.
Files only referenced by URL (favicon, logo lockup) live in `/public` instead.

## Landing page (`landing/`)

The website at `/` (signed out) and `/welcome` is made of these Figma exports from
"Desktop - 2" in the RoyalBlue-Dash (Copy) file, stacked in order. Clickable areas over
the drawn buttons and nav links are set in `src/features/landing/sections.ts`.

| File                   | Section                                             | Size (1×)   |
| ---------------------- | --------------------------------------------------- | ----------- |
| `hero.webp`            | Nav, headline, Open an Account / Learn More         | 1440 × 793  |
| `regulators.png`       | CBN and NDIC strip                                  | 575 × 60    |
| `services.png`         | "Engineered for modern enterprise" grid             | 1270 × 787  |
| `sme.webp`             | "Fueling small and medium enterprises"              | 1270 × 609  |
| `goals.webp`           | Goals cards, "Ready to elevate", savings panel      | 1440 × 1521 |
| `footer.png`           | Footer links, address, regulators                   | 1270 × 105  |
| `copyright.png`        | Copyright line                                      | 1245 × 46   |
| `footer-watermark.png` | Large faded wordmark                                | 1285 × 186  |
| `header-scrolled.png`  | White header shown after scrolling (shadow trimmed) | 1440 × 44   |

**Sharper images:** these are 1× exports, so they look soft on retina screens. Re-export
each frame at **2×** from Figma and save it under the same name; the code measures
everything in 1× design pixels, so nothing else needs to change. WebP (or JPG) keeps the
photo-heavy sections small.

**If a section's layout changes in Figma,** re-export it and update the hotspot boxes for
that section in `sections.ts` (x, y, width and height of each button, in 1× pixels from the
image's top-left corner).
