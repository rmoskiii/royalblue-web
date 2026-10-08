import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { storage } from '@/lib/storage';
import type {
  ApplicationStatus,
  CreditFile,
  StaffBankAccount,
  CreditTeamMember,
  StaffSummary,
} from '../types';

export const staffService = {
  summary(): Promise<StaffSummary> {
    if (env.useMocks) {
      return mockResponse({
        role: 'ADMINISTRATOR',
        assignedToMe: 0,
        frozenAccounts: 0,
        activeAccounts: 0,
        staffHeadcount: 3,
        pipeline: { intake: 0, creditReview: 0, approved: 0, declined: 0, disbursed: 0 },
      });
    }
    return http.get('/staff/summary');
  },

  queue(query?: { status?: ApplicationStatus; mine?: boolean }): Promise<CreditFile[]> {
    if (env.useMocks) return mockResponse([]);
    return http.get('/staff/applications', {
      status: query?.status,
      mine: query?.mine ? true : undefined,
    });
  },

  accounts(): Promise<StaffBankAccount[]> {
    if (env.useMocks) return mockResponse([]);
    return http.get('/staff/accounts');
  },

  team(): Promise<CreditTeamMember[]> {
    if (env.useMocks) return mockResponse([]);
    return http.get('/staff/team');
  },

  creditFile(id: string): Promise<CreditFile> {
    return http.get(`/staff/applications/${id}`);
  },

  assign(id: string, officerId: string) {
    return http.post(`/staff/applications/${id}/assign`, { officerId });
  },

  recommend(
    id: string,
    body: {
      dsrRatio: number;
      monthlyNetIncome: number;
      totalMonthlyDebt: number;
      riskRating: string;
      recommendedAmount: number;
      recommendationType: string;
      officerNotes: string;
    },
  ) {
    return http.post(`/staff/applications/${id}/recommend`, body);
  },

  decide(id: string, body: { decision: ApplicationStatus; finalAmount?: number; decisionNotes: string }) {
    return http.post(`/staff/applications/${id}/decide`, body);
  },

  disburse(id: string) {
    return http.post(`/staff/applications/${id}/disburse`);
  },

  freeze(id: string, reason: string) {
    return http.post(`/staff/accounts/${id}/freeze`, { reason });
  },

  unfreeze(id: string) {
    return http.post(`/staff/accounts/${id}/unfreeze`);
  },

  async documentBlob(applicationId: string, documentId: string) {
    const url = `${window.location.origin}/api/v1/staff/applications/${applicationId}/documents/${documentId}`;
    const raw = storage.get('rb.session');
    const token = raw ? (JSON.parse(raw) as { accessToken?: string }) : {};
    const res = await fetch(url, {
      headers: token.accessToken ? { Authorization: `Bearer ${token.accessToken}` } : undefined,
    });
    if (!res.ok) throw new Error('Could not open document');
    return URL.createObjectURL(await res.blob());
  },
};
