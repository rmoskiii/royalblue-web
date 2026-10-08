import { paths } from '@/components/layout/navigation';

export interface LearnArticle {
  slug: string;
  title: string;
  summary: string;
  body: string[];
  href?: string;
}

export const learnArticles: LearnArticle[] = [
  {
    slug: 'send-money',
    title: 'How to send money',
    summary: 'RoyalBlue to RoyalBlue is free. Other banks may take a fee after your free sends.',
    href: paths.transfer,
    body: [
      'Open Send, choose To RoyalBlue or To other banks, then enter the account number.',
      'We look up the name before you confirm. Check it matches the person you mean to pay.',
      'Enter your 6-digit PIN. A pending send means the payment network still has the request — it is not a PIN error.',
    ],
  },
  {
    slug: 'add-money',
    title: 'How to add money',
    summary: 'Pay your dedicated account from any bank app. Card top-up is also available.',
    href: paths.home,
    body: [
      'Your RoyalBlue NUBAN is on Home. Transfer the amount from your other bank. A ₦50 collection fee is taken from inbound bank transfers.',
      'Card top-up opens BudPay checkout in the browser. We credit you after the payment is verified.',
      'If the NUBAN still says pending, wait — we reuse one dedicated account per customer.',
    ],
  },
  {
    slug: 'limits',
    title: 'Account limits',
    summary: 'Starter, tier 1, 2 and 3 cap how much you can hold and send each day.',
    href: paths.verification,
    body: [
      'Starter accounts can transact up to ₦50,000 until identity is completed.',
      'Account limits walks you through BVN or NIN, photo ID and proof of address.',
      'Raising a tier does not change your PIN or sign-in email.',
    ],
  },
  {
    slug: 'pin-and-sign-in',
    title: 'PIN and sign-in',
    summary: 'The transfer PIN is not your password. Keep both private.',
    href: paths.settingsSecurity,
    body: [
      'Your password opens the app. Your 6-digit PIN confirms sends and bill payments.',
      'Reset a forgotten password from the log-in screen. A PIN reset lives under Sign-in and security.',
      'Turn on sign-in alerts if you want an email when a new browser uses your account.',
    ],
  },
  {
    slug: 'savings-and-loans',
    title: 'Savings and loans',
    summary: 'Vaults hold naira you set aside. Loan products show on Loans when you qualify.',
    href: paths.savings,
    body: [
      'Create a vault with a name and target. Interest on the calculator is illustrative until a product is booked.',
      'Loans need a complete identity file. Staff on the credit desk review applications — the app does not auto-disburse.',
      'Repayments and schedules show on the loan once it is active.',
    ],
  },
];

export function articleBySlug(slug: string | undefined) {
  return learnArticles.find((article) => article.slug === slug);
}
