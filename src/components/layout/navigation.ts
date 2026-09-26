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
  to: string;
  icon: LucideIcon;
}

export const paths = {
  home: '/',
  transfer: '/transfer',
  payBills: '/pay-bills',
  loans: '/loans',
  savings: '/savings',
  invest: '/invest',
  transactions: '/transactions',
  insights: '/insights',
  cards: '/cards',
  rewards: '/rewards',
  refer: '/refer',
  learn: '/learn',
  help: '/help',
  login: '/login',
  signUp: '/sign-up',
  verifyEmail: '/verify-email',
  createPassword: '/create-password',
} as const;

export const primaryNav: NavItem[] = [
  { label: 'Home', to: paths.home, icon: House },
  { label: 'Transfer', to: paths.transfer, icon: Send },
  { label: 'Pay bills', to: paths.payBills, icon: Zap },
  { label: 'Loans', to: paths.loans, icon: Landmark },
  { label: 'Savings', to: paths.savings, icon: Wallet },
  { label: 'Invest', to: paths.invest, icon: TrendingUp },
  { label: 'Transactions', to: paths.transactions, icon: History },
  { label: 'Insights', to: paths.insights, icon: ChartPie },
];

export const learnAndEarnNav: NavItem[] = [
  { label: 'Rewards', to: paths.rewards, icon: Gift },
  { label: 'Refer and earn', to: paths.refer, icon: Users },
  { label: 'Learn', to: paths.learn, icon: BookOpen },
  { label: 'Help centre', to: paths.help, icon: CircleHelp },
];

/** Bottom tab bar on phones (the fifth slot is the More button). */
export const mobileTabs: NavItem[] = [
  { label: 'Home', to: paths.home, icon: House },
  { label: 'Transfer', to: paths.transfer, icon: Send },
  { label: 'Loans', to: paths.loans, icon: Landmark },
  { label: 'Activity', to: paths.transactions, icon: History },
];

/** Items in the phone "More" sheet */
export const moreNav: NavItem[] = [
  { label: 'Pay bills', to: paths.payBills, icon: Zap },
  { label: 'Savings', to: paths.savings, icon: Wallet },
  { label: 'Invest', to: paths.invest, icon: TrendingUp },
  { label: 'Insights', to: paths.insights, icon: ChartPie },
  { label: 'Cards', to: paths.cards, icon: CreditCard },
  { label: 'Rewards', to: paths.rewards, icon: Gift },
  { label: 'Refer and earn', to: paths.refer, icon: Users },
  { label: 'Help centre', to: paths.help, icon: CircleHelp },
];

/** Destinations that exist in the nav but aren't built yet. */
export const comingSoon: NavItem[] = [
  ...primaryNav.filter((i) =>
    [paths.payBills, paths.savings, paths.invest, paths.insights].includes(i.to as never),
  ),
  { label: 'Cards', to: paths.cards, icon: CreditCard },
  ...learnAndEarnNav,
];
