import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockInsights, mockTransactions } from '../mocks/data';
import type { InsightsSummary, Transaction, TransactionFilters } from '../types';

function applyFilters(list: Transaction[], f: TransactionFilters) {
  const q = f.search?.trim().toLowerCase();
  return list.filter(
    (t) =>
      (!f.direction || t.direction === f.direction) &&
      (!f.status || t.status === f.status) &&
      (!q || `${t.title} ${t.counterparty} ${t.type ?? ''} ${t.amount}`.toLowerCase().includes(q)),
  );
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
  ): Promise<{ items: Transaction[]; nextCursor: string | null; hasMore: boolean }> {
    if (env.useMocks) {
      const items = applyFilters(mockTransactions, filters);
      return mockResponse({ items, nextCursor: null, hasMore: false }, 250);
    }
    const page = await http.get<TxnPage>('/accounts/transactions', {
      direction: filters.direction,
      status: filters.status,
      search: filters.search,
      limit: 50,
      cursor,
    });
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
