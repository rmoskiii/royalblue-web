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

const CATALOGUE_TENORS = [3, 6, 12];

const PRODUCT_BLURB: Record<string, string> = {
  RETAIL: 'Stock and till float for shopkeepers.',
  WHOLESALE: 'Inventory and distributor working capital.',
  SME: 'General SME working capital up to ₦20m.',
  'SME-BETA-S': 'SME facilities from ₦1m to ₦3m.',
  'SME-BETA-L': 'Larger SME facilities from ₦3m.',
};

function mapProduct(p: NestProduct): LoanProduct {
  const minTenorMonths = Math.max(3, p.minTenorMonths || 3);
  const maxTenorMonths = Math.min(12, p.maxTenorMonths || 12);
  const tenorOptions = CATALOGUE_TENORS.filter((months) => months >= minTenorMonths && months <= maxTenorMonths);
  const indicativeRatePA = naira(p.interestRatePA);
  return {
    id: p.id,
    name: p.name,
    description: PRODUCT_BLURB[p.code] ?? p.name,
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
    repaymentFrequency: row.repaymentFrequency ?? 'MONTHLY',
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

  quote(
    productId: string,
    amount: number,
    tenor: number,
    ratePA?: number,
    equityPercent?: number,
    frequency?: string,
  ) {
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
      ...(frequency ? { frequency } : {}),
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
