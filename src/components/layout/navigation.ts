import {
  BookOpen,
  ChartPie,
  CircleHelp,
  CreditCard,
  Gift,
  History,
  House,
  Landmark,
  Send,
  Settings,
  ShieldCheck,
  TrendingUp,
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
  home: '/',
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
  login: '/login',
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
} satisfies Record<string, NavItem>;

/** Desktop sidebar, main group */
export const primaryNav: NavItem[] = [
  item.home,
  item.transfers,
  item.payBills,
  item.loans,
  item.savings,
  item.cards,
  item.transactions,
  item.invest,
  item.insights,
];

/** Desktop sidebar, "Learn and earn" group */
export const learnAndEarnNav: NavItem[] = [item.rewards, item.refer, item.learn, item.help];

/** Desktop sidebar, pinned above the profile badge */
export const settingsNav = item.settings;

/** Phone bottom tabs (PRD: Home, Transfers, Savings, Cards). The fifth slot is More. */
export const mobileTabs: NavItem[] = [item.home, item.transfers, item.savings, item.cards];

/** Phone "More" sheet */
export const moreNav: NavItem[] = [
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
];

/** Destinations in the nav that aren't built yet. */
export const comingSoon: (NavItem & { to: string })[] = [
  item.payBills,
  item.savings,
  item.cards,
  item.invest,
  item.insights,
  item.rewards,
  item.refer,
  item.learn,
  item.help,
  item.settings,
];
