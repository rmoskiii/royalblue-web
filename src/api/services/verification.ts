import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockTierLimits, mockVerification } from '../mocks/data';
import type { IdDocumentSubmission, TierLimit, VerificationStatus } from '../types';

export type IdentitySubmitResult = {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string | null;
  photoUrl?: string | null;
  pending?: boolean;
};

// TODO(api): confirm verification endpoints and upload format (multipart vs pre-signed URL).
export const verificationService = {
  getStatus(): Promise<VerificationStatus> {
    if (env.useMocks) return mockResponse(mockVerification);
    return http.get<VerificationStatus>('/verification');
  },

  getTierLimits(): Promise<TierLimit[]> {
    if (env.useMocks) return mockResponse(mockTierLimits);
    return http.get<TierLimit[]>('/verification/tiers');
  },

  submitBvn(bvn: string): Promise<IdentitySubmitResult> {
    if (env.useMocks) {
      return mockResponse({ firstName: 'Ada', lastName: 'Okeke', pending: false }, 700);
    }
    // Same lookup as signup; this route also persists BVN on the applicant.
    return http.post<IdentitySubmitResult>('/kyc/validate-bvn', { bvn });
  },

  submitNin(nin: string): Promise<IdentitySubmitResult> {
    if (env.useMocks) {
      return mockResponse({ firstName: 'Ada', lastName: 'Okeke', pending: false }, 700);
    }
    return http.post<IdentitySubmitResult>('/kyc/validate-id', { type: 'nin', idNumber: nin });
  },

  submitIdDocument({ type, number, documentImage, selfie }: IdDocumentSubmission) {
    if (env.useMocks) return mockResponse(undefined, 900);
    const form = new FormData();
    form.append('type', type);
    form.append('number', number);
    form.append('selfie', selfie);
    if (documentImage) form.append('document', documentImage);
    return http.upload<void>('/verification/id-document', form);
  },

  uploadProofOfAddress(file: File) {
    if (env.useMocks) return mockResponse({ addressVerified: true } as VerificationStatus, 900);
    const form = new FormData();
    form.append('file', file);
    return http.upload<VerificationStatus>('/verification/proof-of-address', form);
  },

  requestAddressReview(note?: string) {
    if (env.useMocks) return mockResponse(undefined, 400);
    return http.post<void>('/verification/proof-of-address/request-review', { note });
  },

  confirmAddress(address: string) {
    if (env.useMocks) return mockResponse(undefined, 400);
    return http.post<void>('/verification/proof-of-address/confirm', { address });
  },
};
