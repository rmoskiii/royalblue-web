import type { Account, Transaction, VerificationStatus } from '@/api/types';
import { formatNaira } from '@/lib/format';
import { paths } from '@/components/layout/navigation';

export type InboxKind = 'money' | 'pending' | 'failed' | 'limits' | 'account';

export interface InboxItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  href: string;
  kind: InboxKind;
}

export function buildInbox(input: {
  account?: Account;
  transactions?: Transaction[];
  verification?: VerificationStatus;
}): InboxItem[] {
  const items: InboxItem[] = [];

  if (input.account?.provisionPending) {
    items.push({
      id: 'account-provision',
      kind: 'account',
      title: 'Your account number is still being set up',
      body: 'You can keep using the app. We’ll show the NUBAN on Home as soon as it’s ready.',
      createdAt: '2020-01-01T00:00:00.000Z',
      href: paths.home,
    });
  }

  if (input.account?.restrictedNoBvn || input.verification?.restrictedNoBvn) {
    items.push({
      id: 'limits-starter',
      kind: 'limits',
      title: 'You’re on starter limits',
      body: 'Raise your daily cap by completing identity on Account limits.',
      createdAt: '2020-01-01T00:00:00.000Z',
      href: paths.verification,
    });
  } else if (input.verification && input.verification.tier < 3) {
    items.push({
      id: `limits-tier-${input.verification.tier}`,
      kind: 'limits',
      title: `You’re on tier ${input.verification.tier}`,
      body: 'Add the next identity step to raise how much you can hold and send.',
      createdAt: '2020-01-01T00:00:00.000Z',
      href: paths.verification,
    });
  }

  if (input.account && input.account.freeTransfersRemaining === 0) {
    items.push({
      id: 'free-transfers-used',
      kind: 'account',
      title: 'This month’s free sends are used',
      body: 'Sends to other banks now include the standard fee. Intra-RoyalBlue stays free.',
      createdAt: '2020-01-01T00:00:00.000Z',
      href: paths.transfer,
    });
  }

  for (const txn of input.transactions ?? []) {
    items.push(fromTransaction(txn));
  }

  return items.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

function fromTransaction(txn: Transaction): InboxItem {
  const amount = formatNaira(txn.amount, 2);
  if (txn.status === 'pending') {
    return {
      id: `txn-${txn.id}`,
      kind: 'pending',
      title: txn.direction === 'debit' ? `${amount} is still processing` : `${amount} inbound is pending`,
      body: txn.counterparty || txn.title,
      createdAt: txn.createdAt,
      href: paths.transactions,
    };
  }
  if (txn.status === 'failed') {
    return {
      id: `txn-${txn.id}`,
      kind: 'failed',
      title: `${amount} didn’t go through`,
      body: txn.counterparty || txn.title,
      createdAt: txn.createdAt,
      href: paths.transactions,
    };
  }
  return {
    id: `txn-${txn.id}`,
    kind: 'money',
    title: txn.direction === 'credit' ? `${amount} received` : `${amount} sent`,
    body: txn.counterparty || txn.title,
    createdAt: txn.createdAt,
    href: paths.transactions,
  };
}
