import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';

/** Phone/tablet reading of the SME PNG: real type instead of a shrunk two-column image. */
export function SmeCapital() {
  return (
    <div className="px-4 pb-10 pt-6 sm:px-8">
      <div className="rounded-2xl bg-[#f5f5f8] px-5 py-7 sm:px-8 sm:py-8">
        <h2 className="max-w-[14ch] text-[1.85rem] font-semibold leading-[1.2] tracking-tight text-[#1B194D] sm:text-[2rem]">
          Fueling small and medium enterprises with real capital.
        </h2>
        <p className="mt-4 max-w-[40ch] text-[1rem] leading-relaxed text-[#5A5A6E]">
          We understand the cash flow dynamics of local businesses. Our loan products offer
          competitive rates, flexible repayment structures, and quick approvals.
        </p>
        <Link
          to={paths.loans}
          className="mt-8 inline-flex h-11 items-center gap-1.5 rounded-full border border-[#1B194D] px-5 text-sm font-medium text-[#1B194D]"
        >
          Apply for Financing
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
