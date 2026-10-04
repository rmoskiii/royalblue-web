import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockAccount, mockBanks, mockBeneficiaries } from '../mocks/data';
import type {
  Bank,
  Beneficiary,
  NameEnquiryResult,
  TransferRequest,
  TransferResult,
} from '../types';

export const transferService = {
  listBanks(): Promise<Bank[]> {
    if (env.useMocks) return mockResponse(mockBanks);
    return http.get<Bank[]>('/transfers/banks');
  },

  listBeneficiaries(): Promise<Beneficiary[]> {
    if (env.useMocks) return mockResponse(mockBeneficiaries);
    return http.get<Beneficiary[]>('/transfers/beneficiaries');
  },

  nameEnquiry(bankCode: string, accountNumber: string): Promise<NameEnquiryResult> {
    if (env.useMocks) {
      const match = mockBeneficiaries.find((b) => b.accountNumber === accountNumber);
      const accountName =
        bankCode === 'royalblue' && accountNumber === mockAccount.accountNumber
          ? mockAccount.accountName
          : (match?.name ?? 'Adebola Johnson');
      return mockResponse({ accountName, accountNumber, bankCode }, 500);
    }
    return http.get<NameEnquiryResult>('/transfers/name-enquiry', { bankCode, accountNumber });
  },

  send(body: TransferRequest): Promise<TransferResult> {
    if (env.useMocks) return mockResponse({ reference: `RB${Date.now()}` }, 900);
    const narration = body.narration?.trim() || 'Transfer';
    const pin = body.authorisation.method === 'pin' ? body.authorisation.pin : undefined;
    if (body.destination === 'royalblue') {
      return http.post<TransferResult>('/transfers/intra', {
        destinationAccountNumber: body.accountNumber,
        amount: body.amount,
        narration,
        pin,
      });
    }
    return http.post<TransferResult>('/transfers/outward', {
      destinationBankCode: body.bankCode,
      destinationAccountNumber: body.accountNumber,
      amount: body.amount,
      narration,
      pin,
    });
  },
};
