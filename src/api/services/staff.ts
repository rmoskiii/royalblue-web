import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import type {
  ApplicationStatus,
  CreditFile,
  StaffBankAccount,
  CreditTeamMember,
  StaffSummary,
  KycAddressReview,
  StaffListPage,
} from '../types';

let mockTeam: CreditTeamMember[] = [
  {
    id: 'usr_001',
    email: 'product@budpay.com',
    phone: '08011111111',
    firstName: 'Product',
    lastName: 'Admin',
    role: 'ADMINISTRATOR',
    isEmailActive: true,
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'staff_lo',
    email: 'officer@example.com',
    phone: '08022222222',
    firstName: 'Ada',
    lastName: 'Loan',
    role: 'LOAN_OFFICER',
    isEmailActive: true,
    createdAt: '2026-10-02T00:00:00.000Z',
  },
  {
    id: 'staff_cm',
    email: 'manager@example.com',
    phone: '08033333333',
    firstName: 'Chidi',
    lastName: 'Credit',
    role: 'CREDIT_MANAGER',
    isEmailActive: false,
    createdAt: '2026-10-03T00:00:00.000Z',
  },
];

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

  queue(query?: {
    status?: ApplicationStatus;
    bucket?: string;
    mine?: boolean;
    q?: string;
    page?: number;
    pageSize?: number;
  }): Promise<StaffListPage<CreditFile>> {
    if (env.useMocks) return mockResponse({ items: [], total: 0, page: 1, pageSize: 20 });
    return http.get('/staff/applications', {
      status: query?.status,
      bucket: query?.bucket,
      mine: query?.mine ? true : undefined,
      q: query?.q,
      page: query?.page,
      pageSize: query?.pageSize,
    });
  },

  accounts(query?: {
    q?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }): Promise<StaffListPage<StaffBankAccount>> {
    if (env.useMocks) return mockResponse({ items: [], total: 0, page: 1, pageSize: 20 });
    return http.get('/staff/accounts', query);
  },

  team(): Promise<CreditTeamMember[]> {
    if (env.useMocks) return mockResponse(mockTeam);
    return http.get('/staff/team');
  },

  invite(body: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    role: CreditTeamMember['role'];
  }): Promise<CreditTeamMember & { message?: string; otp?: string }> {
    if (env.useMocks) {
      const member: CreditTeamMember = {
        id: `staff_${Date.now()}`,
        email: body.email,
        phone: body.phone,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role,
        isEmailActive: false,
        createdAt: new Date().toISOString(),
      };
      mockTeam = [...mockTeam, member];
      return mockResponse({ ...member, message: 'Invite sent. They finish at /staff-join.', otp: '575235' });
    }
    return http.post('/staff/team', body);
  },

  updateRole(id: string, role: CreditTeamMember['role']): Promise<CreditTeamMember> {
    if (env.useMocks) {
      const member = mockTeam.find((row) => row.id === id);
      if (!member) return Promise.reject(new Error('Staff member not found'));
      const admins = mockTeam.filter((row) => row.role === 'ADMINISTRATOR');
      if (member.role === 'ADMINISTRATOR' && role !== 'ADMINISTRATOR' && admins.length < 2) {
        return Promise.reject(new Error('Keep at least one administrator on the credit desk.'));
      }
      const next = { ...member, role };
      mockTeam = mockTeam.map((row) => (row.id === id ? next : row));
      return mockResponse(next);
    }
    return http.patch(`/staff/team/${id}`, { role });
  },

  remove(id: string): Promise<{ message: string }> {
    if (env.useMocks) {
      const member = mockTeam.find((row) => row.id === id);
      if (!member) return Promise.reject(new Error('Staff member not found'));
      mockTeam = mockTeam.filter((row) => row.id !== id);
      return mockResponse({ message: `${member.email} was removed from the credit desk.` });
    }
    return http.delete(`/staff/team/${id}`);
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

  decide(
    id: string,
    body: {
      decision: ApplicationStatus;
      finalAmount?: number;
      finalTenor?: number;
      finalInterestRatePA?: number;
      finalEquityPercent?: number;
      decisionNotes: string;
    },
  ) {
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

  kycReviews(query?: {
    q?: string;
    status?: string;
    decidedBy?: string;
    page?: number;
    pageSize?: number;
  }): Promise<StaffListPage<KycAddressReview>> {
    if (env.useMocks) return mockResponse({ items: [], total: 0, page: 1, pageSize: 20 });
    return http.get('/staff/kyc-reviews', query);
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
