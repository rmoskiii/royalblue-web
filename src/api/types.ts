/**
 * Domain types shared across the app.
 *
 * These are the shapes the UI works with. When the API contract arrives,
 * map API responses into these in src/api/services/* so components don't
 * change. All money amounts are in naira (not kobo).
 */

export type ISODateString = string;

// ---------- Auth ----------
export interface Session {
  accessToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/** Sign-up (PRD FR-01): phone → SMS code → BVN/NIN → confirm → login details */
export type IdentityType = 'bvn' | 'nin';

export interface PhoneVerification {
  /** Short-lived token that ties the sign-up steps together */
  signUpToken: string;
}

/** Details fetched from NIBSS for the customer to confirm */
export interface IdentityLookup {
  firstName: string;
  lastName: string;
  dateOfBirth: ISODateString;
  photoUrl: string | null;
}

export interface CompleteSignUpRequest {
  signUpToken: string;
  email: string;
  password: string;
}

export interface SignUpResult {
  accountNumber: string;
  accountName: string;
}

// ---------- Customer & account ----------
export type KycTier = 1 | 2 | 3;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Account {
  accountNumber: string;
  accountName: string;
  bankName: string;
  balance: number;
  tier: KycTier;
  /** PRD FR-03: free outward transfers left this month, and the monthly allowance */
  freeTransfersRemaining: number;
  freeTransfersPerMonth: number;
}

// ---------- Transactions ----------
export type TransactionDirection = 'credit' | 'debit';
export type TransactionStatus = 'successful' | 'pending' | 'failed';
export type TransactionCategory =
  'income' | 'transfer' | 'bills' | 'airtime' | 'shopping' | 'loan' | 'funding';

export interface Transaction {
  id: string;
  title: string;
  /** Bank, biller or channel, e.g. "Access Bank", "EKEDC prepaid" */
  counterparty: string;
  /** Always positive; use `direction` for the sign */
  amount: number;
  direction: TransactionDirection;
  status: TransactionStatus;
  category: TransactionCategory;
  fee: number;
  reference: string;
  createdAt: ISODateString;
}

export interface TransactionFilters {
  direction?: TransactionDirection;
  status?: TransactionStatus;
  search?: string;
}

export interface InsightsSummary {
  periodLabel: string;
  moneyIn: number;
  moneyOut: number;
  /** Spending split; shares add up to 1 */
  breakdown: { category: string; share: number }[];
}

// ---------- Transfers ----------
export type TransferDestination = 'royalblue' | 'other';

export interface Bank {
  code: string;
  name: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
}

export interface NameEnquiryResult {
  accountName: string;
  accountNumber: string;
  bankCode: string;
}

/** PRD FR-08 / View 3: approve with the 4-digit PIN or a passkey (WebAuthn). */
export type TransferAuthorisation =
  { method: 'pin'; pin: string } | { method: 'passkey'; assertion: string };

export interface TransferRequest {
  destination: TransferDestination;
  bankCode: string;
  accountNumber: string;
  amount: number;
  narration?: string;
  authorisation: TransferAuthorisation;
}

export interface TransferResult {
  reference: string;
}

// ---------- Loans ----------
export type LoanStatus = 'pending' | 'active' | 'closed';
export type LoanProductId = 'working-capital' | 'asset-leasing' | 'lpo-financing' | 'instant-loan';

export interface LoanProduct {
  id: LoanProductId;
  name: string;
  description: string;
  maxAmount: number;
  tenorOptions: number[];
  /** Monthly interest rate, e.g. 0.02 for 2% per month */
  monthlyRate: number;
}

export interface Loan {
  id: string;
  productId: LoanProductId;
  productName: string;
  principal: number;
  monthlyRate: number;
  tenorMonths: number;
  disbursedAt: ISODateString;
  firstRepaymentAt: ISODateString;
  repaymentsMade: number;
  status: LoanStatus;
  autoDebit: boolean;
}

// ---------- Verification (KYC) ----------
/** PRD View 6: BVN validation → ID upload (+ selfie) → proof of address */
export type VerificationStepId = 'bvn' | 'id-document' | 'proof-of-address';
export type IdDocumentType = 'voters-card' | 'passport' | 'drivers-licence' | 'nin-slip';

export interface VerificationStatus {
  tier: KycTier;
  completedSteps: VerificationStepId[];
}

/** PRD §3B tier structure. `null` means unlimited. */
export interface TierLimit {
  tier: KycTier;
  requirements: string;
  singleTransactionLimit: number | null;
  dailyLimit: number | null;
  maxBalance: number | null;
}

export interface IdDocumentSubmission {
  type: IdDocumentType;
  number: string;
  documentImage: File;
  selfie: File;
}
