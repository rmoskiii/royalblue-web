import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import {
  mockBusinessSummary,
  mockCustomerNames,
  mockSettlements,
  mockStaff,
  mockTerminals,
} from '../mocks/business';
import type {
  AddStaffRequest,
  BusinessSummary,
  PaymentChannel,
  PosTerminal,
  Settlement,
  StaffMember,
} from '../types';

export const businessService = {
  getSummary(): Promise<BusinessSummary> {
    if (env.useMocks) return mockResponse(mockBusinessSummary);
    return http.get<BusinessSummary>('/payments/summary');
  },

  listSettlements(): Promise<Settlement[]> {
    if (env.useMocks) return mockResponse(mockSettlements);
    return http.get<Settlement[]>('/payments/settlements');
  },

  listTerminals(): Promise<PosTerminal[]> {
    if (env.useMocks) return mockResponse(mockTerminals);
    return http.get<PosTerminal[]>('/payments/terminals');
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

  listStaff(): Promise<StaffMember[]> {
    if (env.useMocks) return mockResponse(mockStaff);
    return http.get<StaffMember[]>('/payments/staff');
  },

  addStaff(body: AddStaffRequest): Promise<StaffMember> {
    if (env.useMocks) {
      const member: StaffMember = {
        id: `stf_${Date.now()}`,
        ...body,
        role: 'cashier',
        status: 'invited',
        addedAt: new Date().toISOString(),
      };
      mockStaff.push(member);
      return mockResponse(member, 600);
    }
    return http.post<StaffMember>('/payments/staff', body);
  },

  removeStaff(id: string): Promise<void> {
    if (env.useMocks) {
      mockStaff.splice(
        mockStaff.findIndex((s) => s.id === id),
        1,
      );
      return mockResponse(undefined, 400);
    }
    return http.delete<void>(`/payments/staff/${id}`);
  },
};

function randomSettlement(): Settlement {
  const channels: PaymentChannel[] = ['pos', 'pos', 'transfer', 'web'];
  const channel = channels[Math.floor(Math.random() * channels.length)];
  return {
    id: `st_${Date.now()}`,
    createdAt: new Date().toISOString(),
    customerName: mockCustomerNames[Math.floor(Math.random() * mockCustomerNames.length)],
    channel,
    amount: Math.round((2_000 + Math.random() * 180_000) / 500) * 500,
    status: Math.random() < 0.85 ? 'success' : 'pending',
    terminalId: channel === 'pos' ? (Math.random() < 0.5 ? 'pos_1' : 'pos_2') : undefined,
  };
}
