import { Card } from '@/components/ui';

// RoyalBlue's published loan process.
const steps = [
  ['Fund your account', 'Deposit 20% of the loan amount in your RoyalBlue account.'],
  ['Apply online', 'Complete the application and guarantor forms and upload your documents.'],
  ['Get approved', 'Credit desk reviews the file. Once approved, funds land in your RoyalBlue account.'],
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
