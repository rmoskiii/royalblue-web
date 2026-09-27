import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockTierLimits, mockVerification } from '../mocks/data';
import type { IdDocumentSubmission, TierLimit, VerificationStatus } from '../types';

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

  submitBvn(bvn: string) {
    if (env.useMocks) return mockResponse(undefined, 700);
    return http.post<void>('/verification/bvn', { bvn });
  },

  submitIdDocument({ type, number, documentImage, selfie }: IdDocumentSubmission) {
    if (env.useMocks) return mockResponse(undefined, 900);
    const form = new FormData();
    form.append('type', type);
    form.append('number', number);
    form.append('document', documentImage);
    form.append('selfie', selfie);
    return http.upload<void>('/verification/id-document', form);
  },

  uploadProofOfAddress(file: File) {
    if (env.useMocks) return mockResponse(undefined, 900);
    const form = new FormData();
    form.append('file', file);
    return http.upload<void>('/verification/proof-of-address', form);
  },
};
