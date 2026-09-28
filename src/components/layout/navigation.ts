import {
  BookOpen,
  ChartPie,
  CircleHelp,
  CreditCard,
  Gift,
  History,
  House,
  Landmark,
  Receipt,
  Send,
  Settings,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
  Zap,
  type LucideIcon,
} from 'lucide-react';

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
  settings: '/settings',
  payments: '/payments',
  staff: '/staff',
  login: '/login',
  /** Public website; where "/" (the bare Vercel link) lands */
  welcome: '/welcome',
  terms: '/terms',
  privacy: '/privacy',
  signUp: '/sign-up',
} as const;

const item = {
  home: { label: 'Home', to: paths.home, icon: House },
  transfers: { label: 'Transfers', action: 'transfer', icon: Send },
  payBills: { label: 'Pay bills', to: paths.payBills, icon: Zap },
  loans: { label: 'Loans', to: paths.loans, icon: Landmark },
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
  payments: { label: 'Payments', to: paths.payments, icon: Receipt },
  staff: { label: 'Staff access', to: paths.staff, icon: UserCog },
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

/** Personal profile (PRD View 1). Phone tabs per PRD: Home, Transfers, Savings, Cards. */
const personalNav: NavigationSet = {
  primary: [
    item.home,
    item.transfers,
    item.payBills,
    item.loans,
    item.savings,
    item.cards,
    item.transactions,
    item.invest,
    item.insights,
  ],
  learnAndEarn: [item.rewards, item.refer, item.learn, item.help],
  mobileTabs: [item.home, item.transfers, item.savings, item.cards],
  more: [
    item.loans,
    item.payBills,
    item.transactions,
    item.invest,
    item.insights,
    item.verification,
    item.rewards,
    item.refer,
    item.learn,
    item.help,
    item.settings,
  ],
};

/** Business profile (PRD View 2 merchant portal). */
const businessNav: NavigationSet = {
  primary: [
    { ...item.home, label: 'Dashboard' },
    item.payments,
    item.transfers,
    item.staff,
    item.loans,
    item.cards,
    item.payBills,
    item.transactions,
  ],
  learnAndEarn: [],
  mobileTabs: [{ ...item.home, label: 'Dashboard' }, item.payments, item.transfers, item.staff],
  more: [item.loans, item.cards, item.payBills, item.transactions, item.help, item.settings],
};

export const navigationFor = (profile: 'personal' | 'business') =>
  profile === 'business' ? businessNav : personalNav;

/** Desktop sidebar, pinned above the profile badge */
export const settingsNav = item.settings;

/** Destinations in the nav that aren't built yet. */
export const comingSoon: (NavItem & { to: string })[] = [
  item.invest,
  item.insights,
  item.rewards,
  item.refer,
  item.learn,
  item.help,
  item.settings,
];
