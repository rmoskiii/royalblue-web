import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';

const features = [
  {
    title: 'Digital Convenience',
    body: 'Bank anytime, anywhere using our digital channels without unnecessary stress.',
  },
  {
    title: 'Business Support',
    body: 'Helping SMEs access the financial tools they need to grow confidently.',
  },
  {
    title: 'Customer-First Service',
    body: 'Bank anytime, anywhere using our digital channels without unnecessary stress.',
  },
];

/** Phone reading of the navy goals PNG: Playfair headlines + Inter body, stacked. */
export function GoalsBand() {
  return (
    <div className="bg-[#1B194D] px-5 pb-12 pt-10 text-white sm:px-8">
      <h2 className="font-display text-[2rem] leading-[1.15] tracking-[-0.02em]">
        Banking Built Around Your Goals
      </h2>
      <p className="mt-4 max-w-[42ch] text-[0.9rem] leading-relaxed text-white/75">
        RoyalBlue Microfinance Bank exists to make banking simpler, more accessible, and more
        rewarding for every Nigerian.
      </p>
      <ul className="mt-8 grid gap-5">
        {features.map((row) => (
          <li key={row.title}>
            <h3 className="text-[0.95rem] font-medium">{row.title}</h3>
            <p className="mt-1 text-[0.85rem] leading-relaxed text-white/70">{row.body}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 overflow-hidden rounded-2xl bg-[#C93C38] px-5 py-8">
        <h2 className="font-display max-w-[12ch] text-[2rem] leading-[1.15] tracking-[-0.02em]">
          Ready to elevate your financial growth?
        </h2>
        <Link
          to={paths.signUp}
          className="mt-6 inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-[#1B194D]"
        >
          Open an Account
        </Link>
      </div>
    </div>
  );
}
