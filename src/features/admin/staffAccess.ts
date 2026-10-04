import type { ApplicationStatus, StaffRole } from '@/api/types';

export const staffRoleLabel: Record<StaffRole, string> = {
  LOAN_OFFICER: 'Loan officer',
  CREDIT_MANAGER: 'Credit manager',
  ADMINISTRATOR: 'Administrator',
};

export function canRecommend(role?: string | null) {
  return role === 'LOAN_OFFICER' || role === 'ADMINISTRATOR';
}

export function canDecide(role?: string | null) {
  return role === 'CREDIT_MANAGER' || role === 'ADMINISTRATOR';
}

export function canManageAccounts(role?: string | null) {
  return role === 'CREDIT_MANAGER' || role === 'ADMINISTRATOR';
}

export function canManageTeam(role?: string | null) {
  return role === 'ADMINISTRATOR';
}

export function applicantName(row: {
  applicant?: {
    user?: { email?: string };
    individual?: { firstName?: string; lastName?: string } | null;
  } | null;
}) {
  const name = `${row.applicant?.individual?.firstName ?? ''} ${row.applicant?.individual?.lastName ?? ''}`.trim();
  return name || row.applicant?.user?.email || 'Applicant';
}

export function statusTone(status: ApplicationStatus | string) {
  if (
    status === 'APPROVED' ||
    status === 'APPROVED_WITH_CONDITIONS' ||
    status === 'DISBURSED' ||
    status === 'ACTIVE' ||
    status === 'COMPLETED'
  ) {
    return 'success' as const;
  }
  if (status === 'DECLINED' || status === 'DEFAULTED' || status === 'KYC_FAILED') {
    return 'danger' as const;
  }
  if (
    status === 'CREDIT_REVIEW' ||
    status === 'UNDER_REVIEW' ||
    status === 'ADDITIONAL_INFORMATION_REQUIRED' ||
    status === 'KYC_PENDING'
  ) {
    return 'warning' as const;
  }
  return 'neutral' as const;
}

export const intakeStatuses: ApplicationStatus[] = [
  'SUBMITTED',
  'KYC_PENDING',
  'UNDER_REVIEW',
  'ADDITIONAL_INFORMATION_REQUIRED',
];
