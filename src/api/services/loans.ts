import { env } from '@/config/env';
import { http, mockResponse } from '../client';
import { mockLoanProducts, mockLoans } from '../mocks/data';
import type { ApplyLoanRequest, CreditFile, Loan, LoanProduct } from '../types';

type NestProduct = {
  id: string;
  name: string;
  code: string;
  minAmount: number | string;
  maxAmount: number | string;
  minTenorMonths: number;
  maxTenorMonths: number;
  interestRatePA: number | string;
};

function naira(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

function mapProduct(p: NestProduct): LoanProduct {
  const min = p.minTenorMonths;
  const max = p.maxTenorMonths;
  const tenorOptions = min === max ? [min] : [...new Set([min, 3, 6, 12, max])].filter((n) => n >= min && n <= max).sort((a, b) => a - b);
  return {
    id: p.id,
    name: p.name,
    description: p.code,
    maxAmount: naira(p.maxAmount),
    tenorOptions,
    monthlyRate: naira(p.interestRatePA) / 100 / 12,
  };
}

function mapLoan(row: CreditFile): Loan {
  const active = row.status === 'DISBURSED' || row.status === 'ACTIVE' || row.status === 'APPROVED';
  return {
    id: row.id,
    productId: row.loanProduct?.id ?? '',
    productName: row.loanProduct?.name ?? 'Loan',
    principal: naira(row.approvedAmount ?? row.requestedAmount),
    monthlyRate: 0.02,
    tenorMonths: row.tenorMonths,
    disbursedAt: row.submittedAt ?? row.createdAt,
    firstRepaymentAt: row.submittedAt ?? row.createdAt,
    repaymentsMade: 0,
    status: active ? 'active' : row.status === 'DECLINED' ? 'closed' : 'pending',
    autoDebit: Boolean(row.payrollMandateRef),
  };
}

export const loanService = {
  async listLoans(): Promise<Loan[]> {
    if (env.useMocks) return mockResponse(mockLoans);
    const rows = await http.get<CreditFile[]>('/applications');
    return rows.map(mapLoan);
  },

  async listProducts(): Promise<LoanProduct[]> {
    if (env.useMocks) return mockResponse(mockLoanProducts);
    const rows = await http.get<NestProduct[]>('/applications/products');
    return rows.map(mapProduct);
  },

  listApplications(): Promise<CreditFile[]> {
    if (env.useMocks) return mockResponse([]);
    return http.get('/applications');
  },

  getApplication(id: string): Promise<CreditFile> {
    return http.get(`/applications/${id}`);
  },

  async apply(body: ApplyLoanRequest, files: File[]): Promise<CreditFile> {
    const created = await http.post<CreditFile>('/applications', body.application);
    for (const liability of body.liabilities ?? []) {
      await http.post(`/applications/${created.id}/liabilities`, liability);
    }
    await http.post(`/applications/${created.id}/guarantor`, body.guarantor);
    for (const file of files) {
      const form = new FormData();
      form.append('file', file);
      form.append('documentType', file.name.toLowerCase().includes('pay') ? 'payslip' : 'supporting');
      await http.upload(`/applications/${created.id}/documents`, form);
    }
    return http.post(`/applications/${created.id}/submit`);
  },
};
