# Assets

Imported from code (`import img from '@/assets/...'`), so Vite fingerprints and optimises them.
Files only referenced by URL (favicon, logo lockup) live in `/public` instead.

## Landing page (`landing/`)

The website at `/welcome` (where `/` opens) is made of these Figma exports from
"Desktop - 2" in the RoyalBlue-Dash (Copy) file, stacked in order. Clickable areas over
the drawn buttons and nav links are set in `src/features/landing/sections.ts`.

Each file is a **3× PNG export** (the master). At build time, `vite-imagetools` makes 1×,
2× and 3× WebP versions of it, and the browser downloads only the one that suits the
screen: a regular laptop gets 1×, a retina Mac gets 2×. The PNG masters never reach
visitors.

| File                   | Section                                             | Design size (1×) |
| ---------------------- | --------------------------------------------------- | ---------------- |
| `hero.png`             | Nav, headline, Open an Account / Learn More         | 1440 × 793       |
| `regulators.png`       | CBN and NDIC strip                                  | 575 × 60         |
| `services.png`         | "Engineered for modern enterprise" grid             | 1270 × 787       |
| `sme.png`              | "Fueling small and medium enterprises"              | 1270 × 609       |
| `goals.png`            | Goals cards, "Ready to elevate", savings panel      | 1440 × 1521      |
| `footer.png`           | Footer links, address, regulators                   | 1270 × 105       |
| `copyright.png`        | Copyright line                                      | 1245 × 46        |
| `footer-watermark.png` | Large faded wordmark                                | 1284 × 186       |
| `header-scrolled.png`  | White header shown after scrolling (shadow trimmed) | 1440 × 44        |

**Updating from Figma:** select the section layers, export at **3×** PNG, and save over
the file with the same name. Nothing else changes, because the code measures everything in
1× design pixels. (For `header-scrolled.png`, trim the transparent shadow so only the white
bar is left: 4320 × 132.)

**If a section's layout changes in Figma,** also update the hotspot boxes for that section
in `sections.ts` (x, y, width and height of each button, in 1× pixels from the image's
top-left corner). If a section's size changes, update its `width`/`height` there and the
`?w=` widths in its import.
