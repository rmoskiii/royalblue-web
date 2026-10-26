import type {
  Account,
  Card,
  Loan,
  PhysicalCardOrder,
  SavingsVault,
  Transaction,
  VerificationStatus,
} from '@/api/types';
import { formatNaira } from '@/lib/format';
import { paths } from '@/components/layout/navigation';

export type InboxKind = 'money' | 'pending' | 'failed' | 'limits' | 'account' | 'loan' | 'card';

export interface InboxItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  href: string;
  kind: InboxKind;
}

const PINNED = '9999-12-31T00:00:00.000Z';

export function isActionItem(item: InboxItem) {
  return item.kind === 'limits' || item.kind === 'account' || item.kind === 'loan' || item.kind === 'card';
}

export function buildInbox(input: {
  account?: Account;
  transactions?: Transaction[];
  verification?: VerificationStatus;
  loans?: Loan[];
  cards?: Card[];
  physicalOrder?: PhysicalCardOrder | null;
  vaults?: SavingsVault[];
}): InboxItem[] {
  const items: InboxItem[] = [];
  const now = new Date().toISOString();

  if (input.account?.provisionPending) {
    items.push({
      id: 'account-provision',
      kind: 'account',
      title: 'Your account number is still being set up',
      body: 'You can keep using the app. We’ll show your account number on Home as soon as it’s ready.',
      createdAt: PINNED,
      href: paths.home,
    });
  }

  const v = input.verification;
  if (v?.identityVerified === false && (v.hasBvn || v.hasNin)) {
    items.push({
      id: 'identity-unconfirmed',
      kind: 'limits',
      title: 'Identity not confirmed yet',
      body: v.missing?.[0] ?? 'Keep using the account, then finish verification in Account limits.',
      createdAt: PINNED,
      href: paths.verification,
    });
  }
  if (v?.selfieCheck?.status === 'failed') {
    items.push({
      id: 'selfie-failed',
      kind: 'limits',
      title: 'Live selfie didn’t pass',
      body: v.selfieCheck.message || 'You’re still on Tier 1. Try again in Account limits.',
      createdAt: PINNED,
      href: `${paths.verification}?step=id-document`,
    });
  }
  if (v?.addressReviewPending) {
    items.push({
      id: 'limits-address-review',
      kind: 'limits',
      title: 'Proof of address is with staff',
      body: 'Staff will compare the bill to the address you entered and approve or send it back.',
      createdAt: PINNED,
      href: paths.verification,
    });
  } else if (v && (v.addressReturned || ((v.failedAddressUploads ?? 0) > 0 && !v.addressVerified))) {
    items.push({
      id: 'limits-address-returned',
      kind: 'limits',
      title: 'Address check needs another bill',
      body: v.addressReturnReason
        ? `Staff sent this back: ${v.addressReturnReason}`
        : 'Upload a recent utility bill or bank statement in your name that matches the address you entered.',
      createdAt: PINNED,
      href: `${paths.verification}?step=proof-of-address`,
    });
  }
  if (v?.hasNin && !v.hasBvn && v.tier === 1) {
    items.push({
      id: 'limits-add-bvn',
      kind: 'limits',
      title: 'Add BVN to raise Tier 1 send limits',
      body: 'NIN accounts can send ₦30,000 a day. BVN raises that to ₦50,000.',
      createdAt: PINNED,
      href: paths.verification,
    });
  } else if (v && v.tier < 3 && !v.addressReviewPending) {
    items.push({
      id: `limits-tier-${v.tier}`,
      kind: 'limits',
      title: `You’re on tier ${v.tier}`,
      body: 'Add the next identity step to raise how much you can hold and send.',
      createdAt: PINNED,
      href: paths.verification,
    });
  }

  if (input.account && input.account.freeTransfersRemaining === 0) {
    items.push({
      id: 'free-transfers-used',
      kind: 'account',
      title: 'This month’s free sends are used',
      body: 'Sends to other banks now include the standard fee. Intra-RoyalBlue stays free.',
      createdAt: PINNED,
      href: paths.transfer,
    });
  }

  for (const loan of input.loans ?? []) {
    if (loan.status === 'pending' || loan.status === 'under_review') {
      items.push({
        id: `loan-${loan.id}`,
        kind: 'loan',
        title: loan.status === 'under_review' ? 'Loan is with credit' : 'Loan application submitted',
        body: `${loan.productName} · ${formatNaira(loan.principal)} · ${loan.tenorMonths} months`,
        createdAt: loan.disbursedAt || now,
        href: paths.loans,
      });
    } else if (loan.status === 'declined') {
      items.push({
        id: `loan-${loan.id}-declined`,
        kind: 'loan',
        title: 'Loan application was declined',
        body: loan.productName,
        createdAt: loan.disbursedAt || now,
        href: paths.loans,
      });
    } else if (loan.status === 'active') {
      items.push({
        id: `loan-${loan.id}-active`,
        kind: 'loan',
        title: 'Loan is active',
        body: `${loan.productName} · ${loan.repaymentsMade} of ${loan.tenorMonths} repayments made`,
        createdAt: loan.disbursedAt || now,
        href: paths.loans,
      });
    }
  }

  for (const card of input.cards ?? []) {
    if (card.frozen) {
      items.push({
        id: `card-${card.id}-frozen`,
        kind: 'card',
        title: 'A card is frozen',
        body: `${card.kind === 'physical' ? 'Physical' : 'Virtual'} card ···${card.last4}`,
        createdAt: now,
        href: paths.cards,
      });
    }
  }

  if (input.physicalOrder && input.physicalOrder.status !== 'delivered') {
    const label =
      input.physicalOrder.status === 'printing'
        ? 'Your physical card is printing'
        : input.physicalOrder.status === 'out-for-delivery'
          ? 'Your physical card is out for delivery'
          : 'Physical card ordered';
    items.push({
      id: `card-order-${input.physicalOrder.status}`,
      kind: 'card',
      title: label,
      body: 'Track delivery on Cards.',
      createdAt: input.physicalOrder.orderedAt ?? now,
      href: paths.cards,
    });
  }

  for (const vault of input.vaults ?? []) {
    if (vault.lockedUntil && new Date(vault.lockedUntil).getTime() <= Date.now() + 7 * 86_400_000) {
      items.push({
        id: `vault-${vault.id}-unlock`,
        kind: 'account',
        title: `${vault.name} unlocks soon`,
        body: 'Open Savings to see the lock date and rate.',
        createdAt: vault.lockedUntil,
        href: paths.savings,
      });
    }
  }

  for (const txn of input.transactions ?? []) {
    items.push(fromTransaction(txn));
  }

  return items.sort((a, b) => {
    const pin = Number(isActionItem(b)) - Number(isActionItem(a));
    if (pin) return pin;
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });
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
      href: `${paths.transactions}?receipt=${encodeURIComponent(txn.id)}`,
    };
  }
  if (txn.status === 'failed') {
    return {
      id: `txn-${txn.id}`,
      kind: 'failed',
      title: `${amount} didn’t go through`,
      body: txn.counterparty || txn.title,
      createdAt: txn.createdAt,
      href: `${paths.transactions}?receipt=${encodeURIComponent(txn.id)}`,
    };
  }
  return {
    id: `txn-${txn.id}`,
    kind: 'money',
    title: txn.direction === 'credit' ? `${amount} received` : `${amount} sent`,
    body: txn.counterparty || txn.title,
    createdAt: txn.createdAt,
    href: `${paths.transactions}?receipt=${encodeURIComponent(txn.id)}`,
  };
}
