import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import type {
  ApplicationStatus,
  CreditFile,
  StaffBankAccount,
  CreditTeamMember,
  StaffSummary,
  KycAddressReview,
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
        kycReviews: 0,
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

  kycReviews(): Promise<KycAddressReview[]> {
    if (env.useMocks) return mockResponse([]);
    return http.get('/staff/kyc-reviews');
  },

  decideKycReview(applicantId: string, body: { approve: boolean; notes?: string }) {
    return http.post(`/staff/kyc-reviews/${applicantId}/decide`, body);
  },

  async documentBlob(applicationId: string, documentId: string) {
    const blob = await http.blob(`/staff/applications/${applicationId}/documents/${documentId}`);
    return URL.createObjectURL(blob);
  },

  async kycReviewDocument(applicantId: string) {
    const blob = await http.blob(`/staff/kyc-reviews/${applicantId}/document`);
    return URL.createObjectURL(blob);
  },
};
