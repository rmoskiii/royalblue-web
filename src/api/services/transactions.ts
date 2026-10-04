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
      (!q || `${t.title} ${t.counterparty} ${t.amount}`.toLowerCase().includes(q)),
  );
}

type TxnPage = { items: Transaction[] };

export const transactionService = {
  async list(filters: TransactionFilters = {}): Promise<Transaction[]> {
    if (env.useMocks) return mockResponse(applyFilters(mockTransactions, filters), 250);
    const page = await http.get<TxnPage>('/accounts/transactions', {
      direction: filters.direction,
      status: filters.status,
      search: filters.search,
      limit: 50,
    });
    return page.items ?? [];
  },

  getInsights(): Promise<InsightsSummary> {
    if (env.useMocks) return mockResponse(mockInsights);
    return http.get<InsightsSummary>('/accounts/insights');
  },
};
