import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockVerification } from '../mocks/data';
import type { AccountType, IdDocumentType, VerificationStatus } from '../types';

// TODO(api): confirm verification endpoints and upload format (multipart vs pre-signed URL).
export const verificationService = {
  getStatus(): Promise<VerificationStatus> {
    if (env.useMocks) return mockResponse(mockVerification);
    return http.get<VerificationStatus>('/verification');
  },

  setAccountType(accountType: AccountType) {
    if (env.useMocks) return mockResponse(undefined);
    return http.post<void>('/verification/account-type', { accountType });
  },

  submitBvn(bvn: string) {
    if (env.useMocks) return mockResponse(undefined, 700);
    return http.post<void>('/verification/bvn', { bvn });
  },

  submitIdDocument(type: IdDocumentType, number: string) {
    if (env.useMocks) return mockResponse(undefined, 700);
    return http.post<void>('/verification/id-document', { type, number });
  },

  uploadProofOfAddress(file: File) {
    if (env.useMocks) return mockResponse(undefined, 900);
    const form = new FormData();
    form.append('file', file);
    return http.upload<void>('/verification/proof-of-address', form);
  },

  sendPhoneCode(phone: string) {
    if (env.useMocks) return mockResponse(undefined, 600);
    return http.post<void>('/verification/phone', { phone });
  },
};
