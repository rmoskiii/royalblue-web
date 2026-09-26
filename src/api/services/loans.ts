import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockLoanProducts, mockLoans } from '../mocks/data';
import type { Loan, LoanProduct } from '../types';

export const loanService = {
  listLoans(): Promise<Loan[]> {
    if (env.useMocks) return mockResponse(mockLoans);
    return http.get<Loan[]>('/loans');
  },

  listProducts(): Promise<LoanProduct[]> {
    if (env.useMocks) return mockResponse(mockLoanProducts);
    return http.get<LoanProduct[]>('/loans/products');
  },
};
