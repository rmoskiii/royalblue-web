import { Link } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { Card, PageHeader } from '@/components/ui';

const faqs = [
  {
    q: 'A send is still pending',
    a: 'RoyalBlue has passed the request to the payment network. Pending is not a wrong PIN. If it fails, the debit is reversed on your ledger.',
  },
  {
    q: 'I don’t see my account number',
    a: 'Home shows a pending NUBAN until the dedicated account is issued. We keep one account per customer — refresh Home rather than opening another.',
  },
  {
    q: 'I forgot my password',
    a: 'Use Forgot password on the log-in screen. We email a 6-digit code. That does not change your transfer PIN.',
  },
  {
    q: 'How do I raise my limit?',
    a: 'Account limits. Complete identity in order. Starter stays at ₦50,000 until that file is in.',
  },
  {
    q: 'Who sees my PIN?',
    a: 'Nobody. We cannot recover the PIN in plain text. Reset it under Sign-in and security after you sign in.',
  },
];

export function HelpPage() {
  return (
    <div className="mx-auto grid min-w-0 max-w-xl gap-4">
      <PageHeader
        title="Help centre"
        subtitle="Answers for the live app. Payout timing on other banks sits with the payment network."
      />
      <Card className="overflow-hidden p-0">
        {faqs.map((item) => (
          <details key={item.q} className="group border-b border-line last:border-b-0">
            <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              {item.q}
            </summary>
            <p className="px-4 pb-4 text-[13px] leading-relaxed text-ink-2">{item.a}</p>
          </details>
        ))}
      </Card>
      <Card className="grid gap-2 text-sm">
        <p className="font-semibold">Shortcuts</p>
        <Link className="text-brand hover:underline" to={paths.transactions}>
          Transactions
        </Link>
        <Link className="text-brand hover:underline" to={paths.settingsSecurity}>
          Sign-in and security
        </Link>
        <Link className="text-brand hover:underline" to={paths.verification}>
          Account limits
        </Link>
        <Link className="text-brand hover:underline" to={paths.learn}>
          Learn
        </Link>
        <Link className="text-brand hover:underline" to={paths.settingsNotifications}>
          Email alerts
        </Link>
      </Card>
    </div>
  );
}
