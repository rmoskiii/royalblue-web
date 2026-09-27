import { useQuery } from '@tanstack/react-query';
import { accountService } from './services/accounts';
import { billService } from './services/bills';
import { businessService } from './services/business';
import { cardService } from './services/cards';
import { loanService } from './services/loans';
import { profileService } from './services/profiles';
import { savingsService } from './services/savings';
import { transactionService } from './services/transactions';
import { transferService } from './services/transfers';
import { verificationService } from './services/verification';
import type { MeterType, Network, TransactionFilters } from './types';

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
  profiles: ['profiles'] as const,
  business: {
    summary: ['business', 'summary'] as const,
    settlements: ['business', 'settlements'] as const,
    terminals: ['business', 'terminals'] as const,
    staff: ['business', 'staff'] as const,
  },
  savings: {
    summary: ['savings', 'summary'] as const,
    vaults: ['savings', 'vaults'] as const,
  },
  cards: ['cards'] as const,
  cardSecrets: (id: string) => ['cards', id, 'secrets'] as const,
  physicalOrder: ['cards', 'physical-order'] as const,
  addressSearch: (q: string) => ['address-search', q] as const,
  dataPlans: (network: Network) => ['data-plans', network] as const,
  discos: ['discos'] as const,
  meter: (discoId: string, meterNumber: string, meterType: MeterType) =>
    ['meter', discoId, meterNumber, meterType] as const,
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

// ---------- Profiles & business ----------

export const useProfiles = () =>
  useQuery({ queryKey: queryKeys.profiles, queryFn: profileService.list, staleTime: Infinity });

export const useBusinessSummary = () =>
  useQuery({ queryKey: queryKeys.business.summary, queryFn: businessService.getSummary });

export const useSettlements = () =>
  useQuery({ queryKey: queryKeys.business.settlements, queryFn: businessService.listSettlements });

export const useTerminals = () =>
  useQuery({ queryKey: queryKeys.business.terminals, queryFn: businessService.listTerminals });

export const useStaff = () =>
  useQuery({ queryKey: queryKeys.business.staff, queryFn: businessService.listStaff });

// ---------- Savings ----------

export const useSavingsSummary = () =>
  useQuery({ queryKey: queryKeys.savings.summary, queryFn: savingsService.getSummary });

export const useVaults = () =>
  useQuery({ queryKey: queryKeys.savings.vaults, queryFn: savingsService.listVaults });

// ---------- Cards ----------

export const useCards = () => useQuery({ queryKey: queryKeys.cards, queryFn: cardService.list });

/** Only fetched while the customer has the card details revealed. */
export const useCardSecrets = (cardId: string, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.cardSecrets(cardId),
    queryFn: () => cardService.getSecrets(cardId),
    enabled,
    staleTime: 0,
    gcTime: 0,
  });

export const usePhysicalOrder = () =>
  useQuery({ queryKey: queryKeys.physicalOrder, queryFn: cardService.getPhysicalOrder });

export const useAddressSearch = (query: string) =>
  useQuery({
    queryKey: queryKeys.addressSearch(query),
    queryFn: () => cardService.searchAddresses(query),
    enabled: query.trim().length >= 3,
    staleTime: 60_000,
  });

// ---------- Bills ----------

export const useDataPlans = (network: Network) =>
  useQuery({
    queryKey: queryKeys.dataPlans(network),
    queryFn: () => billService.listDataPlans(network),
    staleTime: 5 * 60_000,
  });

export const useDiscos = () =>
  useQuery({ queryKey: queryKeys.discos, queryFn: billService.listDiscos, staleTime: Infinity });

/** Runs once a plausible meter number (11+ digits) is entered. */
export const useMeterLookup = (discoId: string, meterNumber: string, meterType: MeterType) =>
  useQuery({
    queryKey: queryKeys.meter(discoId, meterNumber, meterType),
    queryFn: () => billService.lookupMeter(discoId, meterNumber, meterType),
    enabled: Boolean(discoId) && /^\d{11,13}$/.test(meterNumber),
    staleTime: Infinity,
  });
