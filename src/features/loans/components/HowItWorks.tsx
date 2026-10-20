import { Card } from '@/components/ui';

// RoyalBlue's published loan process.
const steps = [
  ['Fund your account', 'Hold the equity you offered (0–20% of the loan) in your RoyalBlue account. Credit checks this before disbursement.'],
  ['Apply online', 'Propose amount, tenor (up to 12 months), rate, and equity, then complete the guarantor form and documents.'],
  ['Approval then disbursement', 'The credit desk reviews and approves. Disbursement credits your RoyalBlue account; the schedule then shows here.'],
];

export function HowItWorks() {
  return (
    <Card>
      <h2 className="mb-2.5 text-base font-semibold">How it works</h2>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        {steps.map(([title, body], i) => (
          <li key={title} className="grid grid-cols-[32px_1fr] items-start gap-3">
            <span className="grid size-8 place-items-center rounded-full bg-step text-[13px] font-semibold text-white">
              {i + 1}
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-[13px] text-ink-2">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
