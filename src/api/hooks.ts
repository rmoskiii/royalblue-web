import { useQuery } from '@tanstack/react-query';
import { accountService } from './services/accounts';
import { loanService } from './services/loans';
import { transactionService } from './services/transactions';
import { transferService } from './services/transfers';
import { verificationService } from './services/verification';
import type { TransactionFilters } from './types';

/** Central list of React Query keys so invalidation stays consistent. */
export const queryKeys = {
  me: ['me'] as const,
  account: ['account'] as const,
  transactions: (filters: TransactionFilters = {}) => ['transactions', filters] as const,
  insights: ['insights'] as const,
  banks: ['banks'] as const,
  beneficiaries: ['beneficiaries'] as const,
  nameEnquiry: (bankCode: string, accountNumber: string) =>
    ['name-enquiry', bankCode, accountNumber] as const,
  loans: ['loans'] as const,
  loanProducts: ['loan-products'] as const,
  verification: ['verification'] as const,
  tierLimits: ['tier-limits'] as const,
};

export const useMe = () => useQuery({ queryKey: queryKeys.me, queryFn: accountService.getMe });

export const useAccount = () =>
  useQuery({ queryKey: queryKeys.account, queryFn: accountService.getAccount });

export const useTransactions = (filters: TransactionFilters = {}) =>
  useQuery({
    queryKey: queryKeys.transactions(filters),
    queryFn: () => transactionService.list(filters),
    placeholderData: (previous) => previous,
  });

export const useInsights = () =>
  useQuery({ queryKey: queryKeys.insights, queryFn: transactionService.getInsights });

export const useBanks = () =>
  useQuery({ queryKey: queryKeys.banks, queryFn: transferService.listBanks, staleTime: Infinity });

export const useBeneficiaries = () =>
  useQuery({ queryKey: queryKeys.beneficiaries, queryFn: transferService.listBeneficiaries });

/** Runs once a full 10-digit account number is entered. */
export const useNameEnquiry = (bankCode: string, accountNumber: string) =>
  useQuery({
    queryKey: queryKeys.nameEnquiry(bankCode, accountNumber),
    queryFn: () => transferService.nameEnquiry(bankCode, accountNumber),
    enabled: /^\d{10}$/.test(accountNumber) && Boolean(bankCode),
    staleTime: Infinity,
  });

export const useLoans = () =>
  useQuery({ queryKey: queryKeys.loans, queryFn: loanService.listLoans });

export const useLoanProducts = () =>
  useQuery({ queryKey: queryKeys.loanProducts, queryFn: loanService.listProducts });

export const useVerificationStatus = () =>
  useQuery({ queryKey: queryKeys.verification, queryFn: verificationService.getStatus });

export const useTierLimits = () =>
  useQuery({
    queryKey: queryKeys.tierLimits,
    queryFn: verificationService.getTierLimits,
    staleTime: Infinity,
  });
