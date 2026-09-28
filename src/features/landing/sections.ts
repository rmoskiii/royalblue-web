// Each master is a 3x Figma export. The build makes 1x, 2x and 3x WebP versions of it,
// and the browser downloads only the one that fits the screen.
import copyright from '@/assets/landing/copyright.png?w=1245;2490;3735&format=webp&quality=85&as=srcset';
import footerWatermark from '@/assets/landing/footer-watermark.png?w=1284;2568;3853&format=webp&quality=85&as=srcset';
import footer from '@/assets/landing/footer.png?w=1270;2540;3810&format=webp&quality=85&as=srcset';
import goals from '@/assets/landing/goals.png?w=1440;2880;4320&format=webp&quality=85&as=srcset';
import headerScrolled from '@/assets/landing/header-scrolled.png?w=1440;2880;4320&format=webp&quality=85&as=srcset';
import hero from '@/assets/landing/hero.png?w=1440;2880;4320&format=webp&quality=85&as=srcset';
import regulators from '@/assets/landing/regulators.png?w=575;1150;1725&format=webp&quality=85&as=srcset';
import services from '@/assets/landing/services.png?w=1270;2540;3810&format=webp&quality=85&as=srcset';
import sme from '@/assets/landing/sme.png?w=1270;2540;3810&format=webp&quality=85&as=srcset';
import { paths } from '@/components/layout/navigation';

/**
 * The landing page is built from the Figma "Desktop - 2" exports.
 *
 * Everything is measured in 1x Figma pixels on a 1440px-wide page, so the whole
 * page scales down evenly on smaller screens. The image files themselves are 3x
 * exports; replacing one with a new export of the same name needs no other change.
 */
export const DESIGN_WIDTH = 1440;

/** A clickable area over a button or link that's drawn in the image. */
export interface Hotspot {
  label: string;
  /** Box in design pixels, relative to the image's top-left corner */
  x: number;
  y: number;
  w: number;
  h: number;
  /** App route… */
  to?: string;
  /** …or an on-page anchor like "#services" */
  href?: string;
  /** Rounded like the drawn button (buttons) or a soft pill (text links) */
  shape?: 'button' | 'text';
}

/** A named scroll target inside an image, e.g. the calculator half of the goals block */
export interface Anchor {
  id: string;
  y: number;
}

export interface ImageSection {
  id?: string;
  /** Generated srcset (1x/2x/3x WebP) */
  srcSet: string;
  /** Screen-reader and SEO text: everything the image says */
  alt: string;
  width: number;
  height: number;
  /** Left offset on the 1440 page (centred if omitted) */
  x?: number;
  /** Gap above, in design pixels */
  gapAbove: number;
  /** Full-width background behind the section (so it fills screens wider than 1440) */
  background?: string;
  hotspots?: Hotspot[];
  anchors?: Anchor[];
}

const navHotspots: Hotspot[] = [
  { label: 'RoyalBlue home', x: 78, y: 6, w: 118, h: 40, href: '#top', shape: 'text' },
  { label: 'About', x: 1038, y: 13, w: 54, h: 28, href: '#about', shape: 'text' },
  { label: 'Services', x: 1121, y: 13, w: 69, h: 28, href: '#services', shape: 'text' },
  { label: 'Loans', x: 1219, y: 13, w: 53, h: 28, href: '#loans', shape: 'text' },
  { label: 'Savings', x: 1300, y: 13, w: 64, h: 28, href: '#savings', shape: 'text' },
];

/** The white bar from Figma's scrolled header (shadow trimmed; StickyHeader adds its own). */
export const headerImage = {
  srcSet: headerScrolled,
  alt: 'RoyalBlue',
  width: 1440,
  height: 44,
  // Same nav as the hero, 5px higher because the export's top shadow was trimmed
  hotspots: navHotspots.map((h) => ({ ...h, y: Math.max(0, h.y - 5) })),
};

/** Page sections in Figma order, with the Figma spacing between them. */
export const sections: ImageSection[] = [
  {
    id: 'top',
    srcSet: hero,
    alt: 'Exceptional banking that meet customer needs. Experience secure savings, accessible loans, and seamless digital banking designed to help individuals, businesses, and communities grow with confidence.',
    width: 1440,
    height: 793,
    gapAbove: 0,
    background:
      'linear-gradient(180deg, #1b194e 0%, #1b194e 30%, #1f1b4e 45%, #2b1d4d 60%, #381f49 75%, #432148 90%, #4b2347 100%)',
    hotspots: [
      ...navHotspots,
      {
        label: 'Open an Account',
        x: 596,
        y: 492,
        w: 129,
        h: 39,
        to: paths.signUp,
        shape: 'button',
      },
      { label: 'Learn More', x: 733, y: 492, w: 113, h: 39, href: '#services', shape: 'button' },
    ],
  },
  {
    srcSet: regulators,
    alt: 'Licensed by the Central Bank of Nigeria. Insured by the Nigeria Deposit Insurance Corporation (NDIC).',
    width: 575,
    height: 60,
    gapAbove: 26,
  },
  {
    id: 'services',
    srcSet: services,
    alt: 'Engineered for modern enterprise and personal growth. SME and business credit, instant settlements, bank-grade encryption, seamless open APIs, high-yield savings, and corporate expense cards.',
    width: 1270,
    height: 787,
    gapAbove: 29,
  },
  {
    id: 'loans',
    srcSet: sme,
    alt: 'Fueling small and medium enterprises with real capital. We understand the cash flow dynamics of local businesses. Our loan products offer competitive rates, flexible repayment structures, and quick approvals.',
    width: 1270,
    height: 609,
    gapAbove: 85,
    hotspots: [
      {
        label: 'Apply for Financing',
        x: 30,
        y: 540,
        w: 161,
        h: 39,
        to: paths.loans,
        shape: 'button',
      },
    ],
  },
  {
    id: 'about',
    srcSet: goals,
    alt: 'Banking built around your goals. RoyalBlue Microfinance Bank exists to make banking simpler, more accessible, and more rewarding for every Nigerian. Digital convenience, business support and customer-first service. Ready to elevate your financial growth? See how fast your savings grow.',
    width: 1440,
    height: 1521,
    gapAbove: 152,
    background: '#1B194D',
    anchors: [{ id: 'savings', y: 820 }],
    hotspots: [
      {
        label: 'Open an Account',
        x: 115,
        y: 1072,
        w: 130,
        h: 39,
        to: paths.signUp,
        shape: 'button',
      },
    ],
  },
  {
    srcSet: footer,
    alt: 'RoyalBlue. 127 Herbert Macaulay Street, Ebute Metta, Sabo Yaba, Lagos, Nigeria. Leading provider of financial services to small and medium enterprises by helping them achieve their financial goals. Licensed by the Central Bank of Nigeria. Insured by the Nigeria Deposit Insurance Corporation.',
    width: 1270,
    height: 105,
    gapAbove: 68,
    hotspots: [
      { label: 'Terms of Service', x: 440, y: -6, w: 108, h: 28, to: paths.terms, shape: 'text' },
      { label: 'Privacy Policy', x: 608, y: -6, w: 92, h: 28, to: paths.privacy, shape: 'text' },
    ],
  },
  {
    srcSet: copyright,
    alt: '© 2026 RoyalBlue Microfinance Bank Ltd. All rights reserved.',
    width: 1245,
    height: 46,
    gapAbove: 100,
  },
  {
    srcSet: footerWatermark,
    alt: '',
    width: 1285,
    height: 186,
    gapAbove: 10,
  },
];
