import type { InsightsBreakdown } from '@/api/types';

export const SPEND_CATEGORIES = [
  { id: 'shopping', label: 'Shopping', color: 'var(--rb-series-1)' },
  { id: 'food', label: 'Food', color: 'var(--rb-series-2)' },
  { id: 'bills', label: 'Bills', color: 'var(--rb-series-3)' },
  { id: 'airtime', label: 'Airtime and data', color: 'var(--rb-series-4)' },
  { id: 'transport', label: 'Transport', color: 'var(--rb-series-5)' },
  { id: 'transfers', label: 'Transfers', color: 'var(--rb-series-6)' },
  { id: 'loans', label: 'Loans', color: 'var(--rb-series-7)' },
  { id: 'other', label: 'Other', color: 'var(--rb-series-8)' },
] as const;

export type SpendCategoryId = (typeof SPEND_CATEGORIES)[number]['id'];

const LEGACY: Record<string, SpendCategoryId> = {
  shopping: 'shopping',
  food: 'food',
  bills: 'bills',
  airtime: 'airtime',
  'airtime and data': 'airtime',
  transport: 'transport',
  transfer: 'transfers',
  transfers: 'transfers',
  loan: 'loans',
  loans: 'loans',
  other: 'other',
};

export function padBreakdown(rows: InsightsBreakdown[] | undefined, moneyOut: number): InsightsBreakdown[] {
  const byId = new Map<SpendCategoryId, InsightsBreakdown>();
  for (const row of rows ?? []) {
    const key = LEGACY[(row.id ?? row.category).trim().toLowerCase()];
    if (!key) continue;
    const amount = row.amount ?? Math.round(moneyOut * row.share);
    const current = byId.get(key);
    byId.set(key, {
      id: key,
      category: SPEND_CATEGORIES.find((item) => item.id === key)!.label,
      amount: (current?.amount ?? 0) + amount,
      count: (current?.count ?? 0) + (row.count ?? 0),
      share: 0,
    });
  }
  return SPEND_CATEGORIES.map((item) => {
    const hit = byId.get(item.id);
    const amount = hit?.amount ?? 0;
    return {
      id: item.id,
      category: item.label,
      amount,
      count: hit?.count ?? 0,
      share: moneyOut ? amount / moneyOut : 0,
    };
  });
}

export function spendColour(id?: string, fallbackIndex = 0) {
  const match = SPEND_CATEGORIES.find((row) => row.id === id);
  if (match) return match.color;
  return SPEND_CATEGORIES[fallbackIndex % SPEND_CATEGORIES.length]?.color ?? 'var(--rb-series-1)';
}

export function monthDelta(thisMonth: number, lastMonth: number) {
  const delta = thisMonth - lastMonth;
  if (!lastMonth && !thisMonth) return 'Same as last month';
  if (!lastMonth) return 'No spend recorded last month';
  const pct = Math.round((Math.abs(delta) / lastMonth) * 100);
  if (delta === 0) return 'Same as last month';
  if (delta > 0) return `${pct}% more than last month`;
  return `${pct}% less than last month`;
}
