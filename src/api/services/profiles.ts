import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockProfiles } from '../mocks/business';
import type { CustomerProfile, Profile } from '../types';

export const profileService = {
  /** Personal profile plus any business profiles the customer owns (PRD FR-04). */
  list(): Promise<Profile[]> {
    if (env.useMocks) return mockResponse(mockProfiles, 200);
    return http.get<Profile[]>('/profile/switcher');
  },

  get(): Promise<CustomerProfile> {
    if (env.useMocks) {
      const personal = mockProfiles[0];
      return mockResponse({
        staff: false,
        user: {
          id: 'usr_001',
          email: 'temidayo@example.com',
          phone: '08034564521',
          role: 'APPLICANT',
          isEmailActive: true,
          createdAt: new Date().toISOString(),
          firstName: 'Temidayo',
          lastName: 'Adeyemi',
        },
        applicant: {
          id: personal.id,
          entityType: 'INDIVIDUAL',
          kycStatus: 'IN_PROGRESS',
          idDocumentVerified: true,
          addressVerified: false,
          bvn: '*******7890',
          nin: null,
          ippisNumber: null,
          employerType: 'OTHER',
        },
        individual: {
          firstName: 'Temidayo',
          lastName: 'Adeyemi',
          dateOfBirth: '1994-06-12',
          gender: 'Male',
          maritalStatus: 'Single',
          residentialAddress: '12 Admiralty Way, Lekki',
          state: 'Lagos',
          city: 'Lagos',
          employerName: 'Adeyemi Tech Hub',
          jobTitle: 'Founder',
          employmentStartDate: '2021-01-10',
          monthlyNetIncome: 850000,
          bankCode: '000013',
          bankName: 'Guaranty Trust Bank',
          accountNumber: '0123456789',
          accountName: 'Temidayo Adeyemi',
          nextOfKinName: 'Bola Adeyemi',
          nextOfKinPhone: '08030001111',
          nextOfKinRelationship: 'Sister',
        },
        business: null,
        accounts: [
          {
            id: 'acc_1',
            accountNumber: personal.accountNumber,
            accountName: personal.name,
            bankName: 'RoyalBlue MFB',
            status: 'ACTIVE',
          },
        ],
        preferences: {
          loginAlertsEnabled: true,
          transactionAlertsEnabled: true,
          marketingEmailsEnabled: false,
        },
        editable: {
          phone: true,
          password: true,
          address: true,
          employment: true,
          salaryAccount: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
          nin: true,
        },
      });
    }
    return http.get('/profile');
  },

  update(body: Record<string, unknown>): Promise<CustomerProfile> {
    if (env.useMocks) return this.get();
    return http.patch('/profile', body);
  },
};
