import {
  CreditCard,
  PiggyBank,
  Share2,
  Shield,
  Store,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const items: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Store,
    title: 'SME & Business Credit',
    body: 'Flexible working capital loans and line-of-credit solutions designed specifically for growing Nigerian enterprises.',
  },
  {
    icon: Zap,
    title: 'Instant Settlements',
    body: 'Receive funds instantly across all your business accounts with zero payout lag or weekend delays.',
  },
  {
    icon: Shield,
    title: 'Bank-Grade Encryption',
    body: 'Multi-factor authentication, end-to-end data encryption, and 24/7 fraud monitoring for complete peace of mind.',
  },
  {
    icon: Share2,
    title: 'Seamless Open APIs',
    body: 'Easily integrate your custom business software or ERP with our developer-friendly financial APIs.',
  },
  {
    icon: PiggyBank,
    title: 'High-Yield Savings',
    body: 'Competitive interest rates on target and fixed savings accounts to protect and grow your reserve capital.',
  },
  {
    icon: CreditCard,
    title: 'Corporate Expense Cards',
    body: 'Issue physical and virtual debit cards to team members with customizable spending limits and controls.',
  },
];

/** Phone/tablet reading of the services PNG: stacked cards instead of a shrunk desktop grid. */
export function ServicesGrid() {
  return (
    <div className="px-4 pb-2 pt-8 sm:px-8">
      <h2 className="mx-auto max-w-[16ch] text-center text-[1.85rem] font-semibold leading-[1.2] tracking-tight text-balance text-[#1B194D] sm:max-w-[20ch] sm:text-[2rem]">
        Engineered for modern enterprise and personal growth
      </h2>
      <ul className="mt-7 grid gap-3">
        {items.map(({ icon: Icon, title, body }) => (
          <li
            key={title}
            className="flex gap-3.5 rounded-2xl border border-[#ececf2] bg-[#fafafc] px-4 py-4"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-primary shadow-[0_1px_0_#ececf2]">
              <Icon className="size-5" strokeWidth={1.7} aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-[1.05rem] font-semibold leading-snug text-[#1B194D]">{title}</h3>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-[#5A5A6E]">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
