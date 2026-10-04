import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { comingSoon, paths } from '@/components/layout/navigation';
import { PageLoader } from '@/components/ui';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { BusinessOnly } from '@/features/business/BusinessOnly';
import { HomeRoute } from '@/features/home/HomeRoute';
import { LandingPage } from '@/features/landing/LandingPage';
import { LegalPage } from '@/features/landing/LegalPage';
import { ComingSoonPage } from '@/features/misc/ComingSoonPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { TransferRoute } from '@/features/transfer/TransferRoute';
import { RedirectIfAuthenticated, RequireAuth, RequireStaff, RequireStaffRole } from './guards';

/**
 * Code-split a page: its feature bundle downloads the first time the route is visited.
 * Usage: page(() => import('@/features/x/XPage'), (m) => m.XPage)
 */
function page<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  return { lazy: async () => ({ Component: pick(await load()) }) };
}

export const router = createBrowserRouter([
  // The bare URL (e.g. the Vercel link) opens the website
  { path: '/', element: <Navigate to={paths.welcome} replace /> },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.signUp, element: <SignUpPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: paths.home, element: <HomeRoute /> },
          { path: paths.transfer, element: <TransferRoute /> },
          {
            path: paths.loans,
            ...page(
              () => import('@/features/loans/LoansPage'),
              (m) => m.LoansPage,
            ),
          },
          {
            path: paths.loanApply,
            ...page(
              () => import('@/features/loans/ApplyLoanPage'),
              (m) => m.ApplyLoanPage,
            ),
          },
          {
            element: <RequireStaff />,
            children: [
              {
                path: paths.admin,
                ...page(
                  () => import('@/features/admin/StaffDeskPage'),
                  (m) => m.StaffDeskPage,
                ),
              },
              {
                path: paths.adminQueue,
                ...page(
                  () => import('@/features/admin/AdminQueuePage'),
                  (m) => m.AdminQueuePage,
                ),
              },
              {
                path: '/admin/applications/:id',
                ...page(
                  () => import('@/features/admin/AdminCreditFilePage'),
                  (m) => m.AdminCreditFilePage,
                ),
              },
              {
                element: <RequireStaffRole roles={['CREDIT_MANAGER', 'ADMINISTRATOR']} />,
                children: [
                  {
                    path: paths.adminAccounts,
                    ...page(
                      () => import('@/features/admin/StaffAccountsPage'),
                      (m) => m.StaffAccountsPage,
                    ),
                  },
                ],
              },
              {
                element: <RequireStaffRole roles={['ADMINISTRATOR']} />,
                children: [
                  {
                    path: paths.adminTeam,
                    ...page(
                      () => import('@/features/admin/StaffTeamPage'),
                      (m) => m.StaffTeamPage,
                    ),
                  },
                ],
              },
            ],
          },
          {
            path: paths.transactions,
            ...page(
              () => import('@/features/transactions/TransactionsPage'),
              (m) => m.TransactionsPage,
            ),
          },
          {
            path: paths.verification,
            ...page(
              () => import('@/features/verification/VerificationPage'),
              (m) => m.VerificationPage,
            ),
          },
          {
            path: paths.payBills,
            ...page(
              () => import('@/features/bills/BillsPage'),
              (m) => m.BillsPage,
            ),
          },
          {
            path: paths.savings,
            ...page(
              () => import('@/features/savings/SavingsPage'),
              (m) => m.SavingsPage,
            ),
          },
          {
            path: paths.cards,
            ...page(
              () => import('@/features/cards/CardsPage'),
              (m) => m.CardsPage,
            ),
          },
          {
            element: <BusinessOnly />,
            children: [
              {
                path: paths.payments,
                ...page(
                  () => import('@/features/business/PaymentsPage'),
                  (m) => m.PaymentsPage,
                ),
              },
              {
                path: paths.staff,
                ...page(
                  () => import('@/features/business/StaffPage'),
                  (m) => m.StaffPage,
                ),
              },
            ],
          },
          {
            path: paths.settings,
            children: [
              {
                index: true,
                ...page(
                  () => import('@/features/settings/SettingsPage'),
                  (m) => m.SettingsPage,
                ),
              },
              {
                path: 'profile',
                ...page(
                  () => import('@/features/settings/ProfileDetailsPage'),
                  (m) => m.ProfileDetailsPage,
                ),
              },
              {
                path: 'security',
                ...page(
                  () => import('@/features/settings/SecuritySettingsPage'),
                  (m) => m.SecuritySettingsPage,
                ),
              },
              {
                path: 'notifications',
                ...page(
                  () => import('@/features/settings/NotificationsSettingsPage'),
                  (m) => m.NotificationsSettingsPage,
                ),
              },
              {
                path: 'payments',
                ...page(
                  () => import('@/features/settings/PaymentsSettingsPage'),
                  (m) => m.PaymentsSettingsPage,
                ),
              },
            ],
          },
          ...comingSoon.map((item) => ({ path: item.to, element: <ComingSoonPage item={item} /> })),
        ],
      },
    ],
  },
  // Public website pages, available whether or not you're signed in
  { path: paths.welcome, element: <LandingPage /> },
  { path: paths.terms, element: <LegalPage title="Terms of Service" /> },
  { path: paths.privacy, element: <LegalPage title="Privacy Policy" /> },
  { path: '*', element: <NotFoundPage /> },
]);
