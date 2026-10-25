import {
  BookOpen,
  ChartPie,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Gift,
  History,
  House,
  Landmark,
  LayoutDashboard,
  Receipt,
  Send,
  Settings,
  ShieldCheck,
  Snowflake,
  TrendingUp,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { StaffRole } from '@/api/types';
import { isStaffRole } from '@/api/types';

/**
 * Single source of truth for navigation. Sidebar, bottom tabs, the More
 * sheet and the router's coming-soon pages all read from here.
 */

export interface NavItem {
  label: string;
  icon: LucideIcon;
  /** Route to open… */
  to?: string;
  /** …or an in-app action instead of a route (Transfers opens a modal, PRD View 3) */
  action?: 'transfer';
}

export const paths = {
  /** App dashboard ("/" opens the website, see router.tsx) */
  home: '/dashboard',
  transfer: '/transfer',
  payBills: '/pay-bills',
  loans: '/loans',
  loanApply: '/loans/apply',
  admin: '/admin',
  adminQueue: '/admin/queue',
  adminAccounts: '/admin/accounts',
  adminTeam: '/admin/team',
  adminKyc: '/admin/kyc',
  savings: '/savings',
  cards: '/cards',
  invest: '/invest',
  transactions: '/transactions',
  insights: '/insights',
  verification: '/verification',
  rewards: '/rewards',
  refer: '/refer',
  learn: '/learn',
  help: '/help',
  notifications: '/notifications',
  settings: '/settings',
  settingsProfile: '/settings/profile',
  settingsSecurity: '/settings/security',
  settingsNotifications: '/settings/notifications',
  settingsPayments: '/settings/payments',
  payments: '/payments',
  staff: '/staff', // bank operations desk uses /admin; merchant cashiers removed
  login: '/login',
  forgot: '/forgot',
  staffJoin: '/staff-join',
  updatePassword: '/update-password',
  /** Public website; where "/" (the bare Vercel link) lands */
  welcome: '/welcome',
  terms: '/terms',
  privacy: '/privacy',
  signUp: '/sign-up',
} as const;

const item = {
  home: { label: 'Home', to: paths.home, icon: House },
  transfers: { label: 'Send', to: paths.transfer, icon: Send },
  payBills: { label: 'Pay bills', to: paths.payBills, icon: Zap },
  loans: { label: 'Loans', to: paths.loans, icon: Landmark },
  admin: { label: 'Credit desk', to: paths.admin, icon: ClipboardList },
  desk: { label: 'Desk', to: paths.admin, icon: LayoutDashboard },
  pipeline: { label: 'Pipeline', to: paths.adminQueue, icon: ClipboardList },
  review: { label: 'Review', to: paths.adminQueue, icon: ClipboardList },
  accounts: { label: 'Accounts', to: paths.adminAccounts, icon: Snowflake },
  team: { label: 'Team', to: paths.adminTeam, icon: Users },
  kyc: { label: 'KYC reviews', to: paths.adminKyc, icon: ShieldCheck },
  savings: { label: 'Savings', to: paths.savings, icon: Wallet },
  cards: { label: 'Cards', to: paths.cards, icon: CreditCard },
  transactions: { label: 'Transactions', to: paths.transactions, icon: History },
  invest: { label: 'Invest', to: paths.invest, icon: TrendingUp },
  insights: { label: 'Insights', to: paths.insights, icon: ChartPie },
  verification: { label: 'Account limits', to: paths.verification, icon: ShieldCheck },
  rewards: { label: 'Rewards', to: paths.rewards, icon: Gift },
  refer: { label: 'Refer and earn', to: paths.refer, icon: Users },
  learn: { label: 'Learn', to: paths.learn, icon: BookOpen },
  help: { label: 'Help centre', to: paths.help, icon: CircleHelp },
  settings: { label: 'Settings', to: paths.settings, icon: Settings },
  payments: { label: 'Money in', to: paths.payments, icon: Receipt },
} satisfies Record<string, NavItem>;

export interface NavigationSet {
  /** Desktop sidebar, main group */
  primary: NavItem[];
  /** Desktop sidebar, "Learn and earn" group (personal only) */
  learnAndEarn: NavItem[];
  /** Phone bottom tabs; the fifth slot is More */
  mobileTabs: NavItem[];
  /** Phone "More" sheet */
  more: NavItem[];
}

/** Personal profile (PRD View 1). Phone tabs: Home, Transfers, Savings, Loans. */
const personalNav: NavigationSet = {
  primary: [
    item.home,
    item.transfers,
    item.payBills,
    item.loans,
    // item.savings, // parked until savings/vaults API ships
    // item.cards,
    item.transactions,
    // item.invest,
    item.insights,
  ],
  learnAndEarn: [item.rewards, item.refer, item.learn, item.help],
  mobileTabs: [item.home, item.transfers, item.payBills, item.loans],
  more: [
    item.loans,
    item.payBills,
    item.transactions,
    // item.invest,
    item.insights,
    item.verification,
    item.rewards,
    item.refer,
    item.learn,
    item.help,
    item.settings,
  ],
};

/** Business profile: same wallet rails as personal, plus inbound credits. */
const businessNav: NavigationSet = {
  primary: [
    { ...item.home, label: 'Dashboard' },
    item.payments,
    item.transfers,
    item.payBills,
    item.transactions,
    item.loans,
    // item.savings, // parked until savings/vaults API ships
  ],
  learnAndEarn: [],
  mobileTabs: [
    { ...item.home, label: 'Dashboard' },
    item.payments,
    item.transfers,
    item.payBills,
  ],
  more: [item.payBills, item.loans, item.transactions, item.verification, item.help, item.settings],
};

export const navigationFor = (profile: 'personal' | 'business') =>
  profile === 'business' ? businessNav : personalNav;

export function navigationForStaff(role: StaffRole): NavigationSet {
  const desk = item.desk;
  const queue = role === 'CREDIT_MANAGER' ? item.review : item.pipeline;
  if (role === 'LOAN_OFFICER') {
    return {
      primary: [desk, queue],
      learnAndEarn: [],
      mobileTabs: [desk, queue],
      more: [item.kyc, item.help, item.settings],
    };
  }
  if (role === 'CREDIT_MANAGER') {
    return {
      primary: [desk, queue, item.accounts],
      learnAndEarn: [],
      mobileTabs: [desk, queue, item.accounts],
      more: [item.kyc, item.help, item.settings],
    };
  }
  return {
    primary: [desk, queue, item.accounts, item.team],
    learnAndEarn: [],
    mobileTabs: [desk, queue, item.accounts, item.team],
    more: [item.kyc, item.help, item.settings],
  };
}

export function homePathForRole(role?: string | null) {
  return isStaffRole(role) ? paths.admin : paths.home;
}

/** Desktop sidebar, pinned above the profile badge */
export const settingsNav = item.settings;
export const adminNav = item.admin;

/** Destinations parked or not built yet. Cards hidden until payments are reliable. Savings parked until the vaults API ships. */
export const comingSoon: (NavItem & { to: string })[] = [item.invest, item.cards, item.savings];
