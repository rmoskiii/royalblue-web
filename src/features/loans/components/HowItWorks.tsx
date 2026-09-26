import { Card } from '@/components/ui';

// RoyalBlue's published loan process.
const steps = [
  ['Fund your account', 'Deposit 20% of the loan amount in your RoyalBlue account.'],
  ['Apply online', 'Fill in the form and upload your documents. No branch visit.'],
  ['Get approved', 'Once approved, the money lands in your RoyalBlue account.'],
];

export function HowItWorks() {
  return (
    <Card>
      <h2 className="mb-2.5 text-base font-semibold">How it works</h2>
      <ol className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
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
