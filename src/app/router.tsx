import type { ComponentType } from 'react';
import { createBrowserRouter } from 'react-router';
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
import { RedirectIfAuthenticated, RequireAuth } from './guards';

/**
 * Code-split a page: its feature bundle downloads the first time the route is visited.
 * Usage: page(() => import('@/features/x/XPage'), (m) => m.XPage)
 */
function page<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  return { lazy: async () => ({ Component: pick(await load()) }) };
}

export const router = createBrowserRouter([
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
          { index: true, element: <HomeRoute /> },
          { path: paths.transfer, element: <TransferRoute /> },
          {
            path: paths.loans,
            ...page(
              () => import('@/features/loans/LoansPage'),
              (m) => m.LoansPage,
            ),
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
