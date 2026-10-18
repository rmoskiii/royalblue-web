import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockBusinessSummary, mockCustomerNames, mockSettlements } from '../mocks/business';
import type { BusinessSummary, Settlement } from '../types';

export const businessService = {
  getSummary(): Promise<BusinessSummary> {
    if (env.useMocks) return mockResponse(mockBusinessSummary);
    return http.get<BusinessSummary>('/payments/summary');
  },

  listSettlements(): Promise<Settlement[]> {
    if (env.useMocks) return mockResponse(mockSettlements);
    return http.get<Settlement[]>('/payments/settlements');
  },

  subscribeToSettlements(onSettlement: (s: Settlement) => void): () => void {
    if (env.useMocks) {
      const timer = window.setInterval(() => onSettlement(randomSettlement()), 8_000);
      return () => window.clearInterval(timer);
    }
    const timer = window.setInterval(() => {
      void http.get<Settlement[]>('/payments/settlements').then((rows) => {
        const latest = rows[0];
        if (latest) onSettlement(latest);
      });
    }, 8_000);
    return () => window.clearInterval(timer);
  },
};

function randomSettlement(): Settlement {
  return {
    id: `st_${Date.now()}`,
    createdAt: new Date().toISOString(),
    customerName: mockCustomerNames[Math.floor(Math.random() * mockCustomerNames.length)],
    channel: 'transfer',
    amount: Math.round((2_000 + Math.random() * 180_000) / 500) * 500,
    status: Math.random() < 0.85 ? 'success' : 'pending',
  };
}
