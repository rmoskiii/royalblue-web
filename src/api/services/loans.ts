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
  const minTenorMonths = Math.max(1, p.minTenorMonths || 1);
  const maxTenorMonths = Math.min(12, p.maxTenorMonths || 12);
  const tenorOptions =
    minTenorMonths === maxTenorMonths
      ? [minTenorMonths]
      : Array.from({ length: maxTenorMonths - minTenorMonths + 1 }, (_, i) => minTenorMonths + i);
  const indicativeRatePA = naira(p.interestRatePA);
  return {
    id: p.id,
    name: p.name,
    description: p.code,
    minAmount: naira(p.minAmount),
    maxAmount: naira(p.maxAmount),
    minTenorMonths,
    maxTenorMonths,
    tenorOptions,
    indicativeRatePA,
    monthlyRate: indicativeRatePA / 100 / 12,
  };
}

function loanStatus(status: CreditFile['status']): Loan['status'] {
  if (status === 'DISBURSED' || status === 'ACTIVE') return 'active';
  if (status === 'COMPLETED') return 'closed';
  if (status === 'DECLINED' || status === 'DEFAULTED') return 'declined';
  if (status === 'CREDIT_REVIEW' || status === 'UNDER_REVIEW') return 'under_review';
  return 'pending';
}

function mapLoan(row: CreditFile): Loan {
  const rateFromOffer = row.offeredInterestRatePA != null ? naira(row.offeredInterestRatePA) / 100 / 12 : 0;
  const rateFromProduct = row.loanProduct?.interestRatePA
    ? naira(row.loanProduct.interestRatePA) / 100 / 12
    : 0.02;
  return {
    id: row.id,
    productId: row.loanProduct?.id ?? '',
    productName: row.loanProduct?.name ?? 'Loan',
    principal: naira(row.approvedAmount ?? row.requestedAmount),
    monthlyRate: naira(row.monthlyRate) || rateFromOffer || rateFromProduct,
    tenorMonths: row.approvedTenorMonths ?? row.tenorMonths,
    disbursedAt: row.disbursedAt ?? row.submittedAt ?? row.createdAt,
    firstRepaymentAt: row.firstRepaymentAt ?? row.disbursedAt ?? row.createdAt,
    repaymentsMade: row.repaymentsMade ?? 0,
    status: loanStatus(row.status),
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

  quote(productId: string, amount: number, tenor: number, ratePA?: number, equityPercent?: number) {
    return http.get<{
      monthlyPayment: number;
      totalRepayable: number;
      totalInterest: number;
      equity: number;
      monthlyRate: number;
      offeredInterestRatePA: number;
    }>(`/applications/products/${productId}/quote`, {
      amount,
      tenor,
      ...(ratePA != null ? { rate: ratePA } : {}),
      ...(equityPercent != null ? { equity: equityPercent } : {}),
    });
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
