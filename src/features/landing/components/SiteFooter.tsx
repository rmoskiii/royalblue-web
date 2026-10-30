import { Link } from 'react-router';
import { Logo } from '@/components/ui';
import { paths } from '@/components/layout/navigation';

/** Phone reading of the footer PNG: padded copy instead of a shrunk 1440 strip. */
export function SiteFooter() {
  return (
    <footer className="bg-[#1B194D] px-5 pb-10 pt-8 text-white sm:px-8">
      <Link to={paths.welcome} aria-label="RoyalBlue home" className="inline-block">
        <Logo onDark className="h-10" />
      </Link>
      <p className="mt-5 max-w-[34ch] text-[0.85rem] leading-relaxed text-white/75">
        127 Herbert Macaulay Street, Ebute Metta, Sabo Yaba, Lagos, Nigeria.
      </p>
      <p className="mt-3 max-w-[42ch] text-[0.85rem] leading-relaxed text-white/75">
        Leading provider of financial services to small and medium enterprises by helping them
        achieve their financial goals.
      </p>
      <nav aria-label="Legal" className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[0.9rem] font-medium">
        <Link to={paths.terms} className="hover:underline">
          Terms of Service
        </Link>
        <Link to={paths.privacy} className="hover:underline">
          Privacy Policy
        </Link>
      </nav>
      <p className="mt-6 text-[0.8rem] leading-relaxed text-white/60">
        Licensed by the Central Bank of Nigeria. Insured by the Nigeria Deposit Insurance
        Corporation (NDIC).
      </p>
      <p className="mt-8 border-t border-white/10 pt-6 text-[0.75rem] text-white/50">
        © 2026 RoyalBlue Microfinance Bank Ltd. All rights reserved.
      </p>
    </footer>
  );
}
