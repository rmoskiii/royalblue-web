import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockInsights, mockTransactions } from '../mocks/data';
import type { InsightsSummary, Transaction, TransactionFilters } from '../types';

function applyFilters(list: Transaction[], f: TransactionFilters) {
  const q = f.search?.trim().toLowerCase();
  const from = f.from ? Date.parse(`${f.from}T00:00:00+01:00`) : undefined;
  const to = f.to ? Date.parse(`${f.to}T23:59:59.999+01:00`) : undefined;
  return list.filter((t) => {
    const at = Date.parse(t.createdAt);
    if (f.direction && t.direction !== f.direction) return false;
    if (f.status && t.status !== f.status) return false;
    if (from && at < from) return false;
    if (to && at > to) return false;
    if (q && !`${t.title} ${t.counterparty} ${t.type ?? ''} ${t.amount}`.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

type TxnPage = { items: Transaction[]; nextCursor?: string | null; hasMore?: boolean };

export const transactionService = {
  async list(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const page = await this.listPage(filters);
    return page.items;
  },

  async listPage(
    filters: TransactionFilters = {},
    cursor?: string,
    signal?: AbortSignal,
  ): Promise<{ items: Transaction[]; nextCursor: string | null; hasMore: boolean }> {
    if (env.useMocks) {
      const items = applyFilters(mockTransactions, filters);
      return mockResponse({ items, nextCursor: null, hasMore: false }, 250, signal);
    }
    const page = await http.get<TxnPage>(
      '/accounts/transactions',
      {
        direction: filters.direction,
        status: filters.status,
        search: filters.search,
        from: filters.from,
        to: filters.to,
        limit: 50,
        cursor,
      },
      signal,
    );
    return {
      items: page.items ?? [],
      nextCursor: page.nextCursor ?? null,
      hasMore: Boolean(page.hasMore),
    };
  },

  getInsights(): Promise<InsightsSummary> {
    if (env.useMocks) return mockResponse(mockInsights);
    return http.get<InsightsSummary>('/accounts/insights');
  },
};
