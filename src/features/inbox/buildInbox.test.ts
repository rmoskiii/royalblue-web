import { describe, expect, it } from 'vitest';
import { buildInbox, isActionItem } from './buildInbox';

describe('buildInbox', () => {
  it('puts KYC and loan items above ledger rows', () => {
    const items = buildInbox({
      verification: {
        tier: 1,
        completedSteps: [],
        hasNin: true,
        hasBvn: false,
      },
      loans: [
        {
          id: 'l1',
          productId: 'sme-working-capital',
          productName: 'Working capital',
          principal: 500_000,
          monthlyRate: 0.02,
          tenorMonths: 6,
          disbursedAt: '2026-01-01T00:00:00.000Z',
          firstRepaymentAt: '2026-02-01T00:00:00.000Z',
          repaymentsMade: 0,
          status: 'under_review',
          autoDebit: false,
        },
      ],
      transactions: [
        {
          id: 't1',
          title: 'Transfer',
          amount: 1_000,
          direction: 'debit',
          status: 'successful',
          createdAt: '2026-10-20T12:00:00.000Z',
          counterparty: 'Ada',
          category: 'transfer',
          fee: 0,
          reference: 'RB-1',
        },
      ],
    });
    expect(items.filter(isActionItem).map((row) => row.id)).toEqual(
      expect.arrayContaining(['limits-add-bvn', 'loan-l1']),
    );
    expect(items.at(-1)?.id).toBe('txn-t1');
  });
});
