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
  identifier?: string;
  email?: string;
  phone?: string;
  password: string;
}

export interface MfaChallenge {
  mfaRequired: true;
  challengeToken: string;
  methods: Array<'totp' | 'otp'>;
  email: string;
}

export interface SecuritySettings {
  totpEnabled: boolean;
  pinSet: boolean;
  loginAlertsEnabled: boolean;
  transactionAlertsEnabled?: boolean;
  marketingEmailsEnabled?: boolean;
  passwordSet: boolean;
  biometricsAvailable: boolean;
}

/** Sign-up (PRD FR-01): phone → SMS code → BVN/NIN → confirm → login details */
export type IdentityType = 'bvn' | 'nin';

export interface PhoneVerification {
  /** Short-lived token that ties the sign-up steps together */
  signUpToken: string;
}

/** Details fetched from NIBSS/BudPay KYC for the customer to confirm */
export interface IdentityLookup {
  firstName: string;
  lastName: string;
  dateOfBirth?: ISODateString | null;
  photoUrl: string | null;
  pending?: boolean;
  verified?: boolean;
}

export type AccountKind = 'personal' | 'business';
export type EntityType =
  | 'INDIVIDUAL'
  | 'SOLE_PROPRIETOR'
  | 'LIMITED_ENTITY'
  | 'NGO'
  | 'GOVERNMENT_AGENCY';

export interface CompleteSignUpRequest {
  signUpToken: string;
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  bvn?: string;
  nin?: string;
  pin?: string;
  totpCode?: string;
  accountKind?: AccountKind;
  entityType?: EntityType;
  business?: {
    registeredName: string;
    tradeName?: string;
    registrationNumber?: string;
    description?: string;
  };
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
  displayName?: string;
  businessName?: string | null;
  role?: StaffRole | 'APPLICANT';
}

export type StaffRole = 'ADMINISTRATOR' | 'LOAN_OFFICER' | 'CREDIT_MANAGER';

export const staffRoles: StaffRole[] = ['ADMINISTRATOR', 'LOAN_OFFICER', 'CREDIT_MANAGER'];

export function isStaffRole(role?: string | null): role is StaffRole {
  return staffRoles.includes(role as StaffRole);
}

export interface Account {
  accountNumber: string;
  accountName: string;
  bankName: string;
  balance: number;
  tier: KycTier;
  restrictedNoBvn?: boolean;
  singleTransactionLimit?: number;
  dailyLimit?: number | null;
  maxBalance?: number | null;
  /** PRD FR-03: free outward transfers left this month, and the monthly allowance */
  freeTransfersRemaining: number;
  freeTransfersPerMonth: number;
  /** True when the API will accept a BudPay sandbox / test top-up. */
  sandbox?: boolean;
}

export interface CustomerProfile {
  staff: boolean;
  user: {
    id: string;
    email: string;
    phone: string;
    role?: string;
    isEmailActive: boolean;
    createdAt: ISODateString;
    firstName: string;
    lastName: string;
  };
  applicant: {
    id: string;
    entityType: string;
    kycStatus: string;
    idDocumentVerified?: boolean;
    addressVerified?: boolean;
    bvn?: string | null;
    nin?: string | null;
    ippisNumber?: string | null;
    employerType?: string;
  } | null;
  individual: {
    firstName: string;
    lastName: string;
    dateOfBirth?: string | null;
    gender?: string | null;
    maritalStatus?: string | null;
    residentialAddress?: string | null;
    state?: string | null;
    city?: string | null;
    employerName?: string | null;
    jobTitle?: string | null;
    employmentStartDate?: string | null;
    monthlyNetIncome?: number | null;
    bankCode?: string | null;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    nextOfKinName?: string | null;
    nextOfKinPhone?: string | null;
    nextOfKinRelationship?: string | null;
  } | null;
  business: {
    id?: string;
    registeredName: string;
    tradeName?: string | null;
    registrationNumber: string;
    businessAddress?: string | null;
    state?: string | null;
    city?: string | null;
  } | null;
  accounts: Array<{
    id: string;
    accountNumber: string;
    accountName: string;
    bankName: string;
    status: string;
  }>;
  preferences: {
    loginAlertsEnabled: boolean;
    transactionAlertsEnabled: boolean;
    marketingEmailsEnabled: boolean;
  };
  editable: Record<string, boolean>;
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

/** Approve money movements with the 6-digit transaction PIN from sign-up. */
export type TransactionAuthorisation =
  { method: 'pin'; pin: string } | { method: 'passkey'; assertion: string };

export interface TransferRequest {
  destination: TransferDestination;
  bankCode: string;
  accountNumber: string;
  amount: number;
  narration?: string;
  authorisation: TransactionAuthorisation;
}

export interface TransferResult {
  reference: string;
}

// ---------- Loans ----------
export type LoanStatus = 'pending' | 'active' | 'closed' | 'under_review' | 'declined';
export type LoanProductId = string;

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
  restrictedNoBvn?: boolean;
  kycStatus?: string;
  hasBvn?: boolean;
  hasNin?: boolean;
  identityVerified?: boolean;
  completedSteps: VerificationStepId[];
  missing?: string[];
  limits?: {
    singleTransactionLimit: number;
    dailyLimit: number | null;
    maxBalance: number | null;
  };
}

/** PRD §3B tier structure. `null` means unlimited. */
export interface TierLimit {
  tier: KycTier;
  restrictedNoBvn?: boolean;
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

// ---------- Profiles (PRD FR-04) ----------
export type ProfileType = 'personal' | 'business';

export interface Profile {
  id: string;
  type: ProfileType;
  /** "Temidayo Adeyemi" or the registered business name */
  name: string;
  accountNumber: string;
}

// ---------- Merchant portal (PRD View 2) ----------
export interface BusinessSummary {
  todayVolume: number;
  pendingPayout: number;
  terminalsActive: number;
  terminalsOnline: number;
}

export type PaymentChannel = 'pos' | 'web' | 'transfer';
export type SettlementStatus = 'success' | 'pending';

/** An incoming payment to the business account */
export interface Settlement {
  id: string;
  createdAt: ISODateString;
  customerName: string;
  channel: PaymentChannel;
  amount: number;
  status: SettlementStatus;
  terminalId?: string;
}

export interface PosTerminal {
  id: string;
  serial: string;
  label: string;
  status: 'online' | 'offline';
  lastTransactionAt: ISODateString | null;
}

export type StaffStatus = 'active' | 'invited';

/** Cashiers get read-only access to incoming credit alerts */
export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'cashier';
  status: StaffStatus;
  addedAt: ISODateString;
}

export interface AddStaffRequest {
  name: string;
  email: string;
  phone: string;
}

// ---------- Savings (PRD FR-05, View 4) ----------
export type VaultType = 'target' | 'fixed';
export type ContributionFrequency = 'daily' | 'weekly' | 'monthly';

export interface SavingsVault {
  id: string;
  name: string;
  type: VaultType;
  balance: number;
  /** Goal amount for target vaults */
  target: number | null;
  /** e.g. 0.15 for 15% p.a. */
  annualRate: number;
  autoSave: { amount: number; frequency: ContributionFrequency } | null;
  /** Fixed vaults can't be withdrawn from before this date */
  lockedUntil: ISODateString | null;
  createdAt: ISODateString;
}

export interface SavingsSummary {
  totalBalance: number;
  interestEarned: number;
  annualRate: number;
  /** When interestEarned was calculated; the UI accrues from here in real time */
  asOf: ISODateString;
}

export interface CreateVaultRequest {
  name: string;
  type: VaultType;
  target: number | null;
  autoSave: { amount: number; frequency: ContributionFrequency } | null;
  lockedUntil: ISODateString | null;
}

// ---------- Cards (PRD FR-06, View 5) ----------
export type CardKind = 'virtual' | 'physical';
export type CardScheme = 'visa' | 'mastercard' | 'verve';

export interface CardControls {
  onlinePayments: boolean;
  international: boolean;
  dailyLimit: number;
}

export interface Card {
  id: string;
  kind: CardKind;
  scheme: CardScheme;
  last4: string;
  /** MM/YY */
  expiry: string;
  nameOnCard: string;
  frozen: boolean;
  controls: CardControls;
}

/** Full card number and CVV, fetched only when the customer taps "Show details" */
export interface CardSecrets {
  pan: string;
  cvv: string;
}

export interface DeliveryAddress {
  line1: string;
  city: string;
  state: string;
}

export interface AddressSuggestion extends DeliveryAddress {
  id: string;
}

export type PhysicalCardOrderStatus = 'ordered' | 'printing' | 'out-for-delivery' | 'delivered';

export interface PhysicalCardOrder {
  id: string;
  status: PhysicalCardOrderStatus;
  address: DeliveryAddress;
  phone: string;
  orderedAt: ISODateString;
  estimatedDelivery: ISODateString;
}

export interface PhysicalCardOrderRequest {
  address: DeliveryAddress;
  phone: string;
}

// ---------- Bills (PRD FR-07) ----------
export type Network = 'mtn' | 'airtel' | 'glo' | '9mobile';
export type MeterType = 'prepaid' | 'postpaid';

export interface DataPlan {
  id: string;
  network: Network;
  name: string;
  validity: string;
  price: number;
}

export interface Disco {
  id: string;
  name: string;
  shortName: string;
}

export interface MeterLookup {
  customerName: string;
  address: string;
  meterNumber: string;
  meterType: MeterType;
  discoId: string;
}

export type BillPayment =
  | { type: 'airtime'; network: Network; phone: string; amount: number }
  | { type: 'data'; network: Network; phone: string; planId: string; amount: number }
  | {
      type: 'electricity';
      discoId: string;
      meterNumber: string;
      meterType: MeterType;
      amount: number;
    };

export type BillPaymentRequest = BillPayment & { authorisation: TransactionAuthorisation };

export interface BillPaymentResult {
  reference: string;
  /** Prepaid electricity only */
  token?: string;
  units?: number;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'KYC_PENDING'
  | 'KYC_FAILED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFORMATION_REQUIRED'
  | 'CREDIT_REVIEW'
  | 'APPROVED'
  | 'APPROVED_WITH_CONDITIONS'
  | 'DECLINED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'DEFAULTED';

export interface LoanGuarantor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  employer: string;
  occupation?: string;
  residentialAddress?: string;
  relationship?: string;
  income: number;
}

export interface LoanFacility {
  id: string;
  lenderName: string;
  facilityType: string;
  originalAmount: number;
  outstandingBal: number;
  monthlyRepayment: number;
}

export interface LoanDocument {
  id: string;
  documentType: string;
  status: string;
  createdAt: ISODateString;
}

export interface CreditFile {
  id: string;
  applicationNumber: string;
  status: ApplicationStatus;
  requestedAmount: number;
  approvedAmount?: number | null;
  tenorMonths: number;
  purpose: string;
  nextOfKinName?: string | null;
  nextOfKinPhone?: string | null;
  nextOfKinRelationship?: string | null;
  salaryBankName?: string | null;
  salaryAccountNumber?: string | null;
  bureauProvider?: string | null;
  payrollMandateRef?: string | null;
  submittedAt?: ISODateString | null;
  createdAt: ISODateString;
  loanProduct?: { id: string; name: string; code: string };
  applicant?: {
    ippisNumber?: string | null;
    user?: { email: string; phone: string };
    individual?: { firstName: string; lastName: string; employerName?: string | null };
  };
  guarantors?: LoanGuarantor[];
  existingFacilities?: LoanFacility[];
  documents?: LoanDocument[];
  assessments?: Array<{
    id: string;
    dsrRatio: number;
    monthlyNetIncome: number;
    totalMonthlyDebt: number;
    riskRating: string;
    recommendedAmount: number;
    officerNotes: string;
    createdAt: ISODateString;
  }>;
  decisions?: Array<{
    id: string;
    decision: ApplicationStatus;
    finalAmount?: number | null;
    decisionNotes: string;
    createdAt: ISODateString;
  }>;
  assignedOfficer?: { id: string; email: string } | null;
}

export interface StaffSummary {
  role: StaffRole | string;
  assignedToMe: number;
  frozenAccounts: number;
  activeAccounts: number;
  staffHeadcount: number;
  pipeline: {
    intake: number;
    creditReview: number;
    approved: number;
    declined: number;
    disbursed: number;
  };
}

export interface StaffBankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  status: string;
  freezeReason?: string | null;
  availableBalance?: number | string;
  applicant?: {
    user?: { email: string };
    individual?: { firstName: string; lastName: string } | null;
  } | null;
}

export interface CreditTeamMember {
  id: string;
  email: string;
  role: StaffRole;
  isEmailActive: boolean;
  createdAt: ISODateString;
}

export interface ApplyLoanRequest {
  application: {
    loanProductId: string;
    requestedAmount: number;
    tenorMonths: number;
    purpose: string;
    ippisNumber?: string;
    nextOfKinName: string;
    nextOfKinPhone: string;
    nextOfKinRelationship: string;
    salaryBankName?: string;
    salaryAccountNumber?: string;
    residentialAddress: string;
    employerName: string;
    jobTitle?: string;
    monthlyNetIncome: number;
    declarationAccepted: boolean;
  };
  liabilities?: Array<{
    lenderName: string;
    facilityType: string;
    originalAmount: number;
    outstandingBal: number;
    monthlyRepayment: number;
  }>;
  guarantor: {
    fullName: string;
    email: string;
    phone: string;
    employer: string;
    occupation: string;
    residentialAddress: string;
    relationship: string;
    bvn?: string;
    income: number;
    bankName?: string;
    accountNumber?: string;
    declarationAccepted: boolean;
  };
}

