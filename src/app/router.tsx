import { useEffect, type ComponentType } from 'react';
import { createBrowserRouter, Navigate, useRouteError } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { comingSoon, paths } from '@/components/layout/navigation';
import { PageLoader } from '@/components/ui';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { BusinessOnly } from '@/features/business/BusinessOnly';
import { HomeRoute } from '@/features/home/HomeRoute';
import { LandingPage } from '@/features/landing/LandingPage';
import { LegalPage } from '@/features/landing/LegalPage';
import { ComingSoonPage } from '@/features/misc/ComingSoonPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { TransferRoute } from '@/features/transfer/TransferRoute';
import {
  CustomerOnly,
  RedirectIfAuthenticated,
  RequireAuth,
  RequireStaff,
  RequireStaffRole,
} from './guards';

const STALE_CHUNK = 'rb.stale-chunk';

function isStaleChunk(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
    message,
  );
}

/** After a Vercel deploy, old hashed chunks 404 until the tab reloads. */
async function importPage<M>(load: () => Promise<M>): Promise<M> {
  try {
    const mod = await load();
    sessionStorage.removeItem(STALE_CHUNK);
    return mod;
  } catch (error) {
    if (!isStaleChunk(error)) throw error;
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    try {
      const mod = await load();
      sessionStorage.removeItem(STALE_CHUNK);
      return mod;
    } catch {
      if (!sessionStorage.getItem(STALE_CHUNK)) {
        sessionStorage.setItem(STALE_CHUNK, '1');
        window.location.reload();
        return new Promise(() => undefined as never);
      }
      throw error;
    }
  }
}

function ChunkLoadFallback() {
  const error = useRouteError();
  const stale = isStaleChunk(error);
  useEffect(() => {
    if (!stale || sessionStorage.getItem(STALE_CHUNK)) return;
    sessionStorage.setItem(STALE_CHUNK, '1');
    window.location.reload();
  }, [stale]);
  if (stale) return <PageLoader />;
  return <NotFoundPage />;
}

/**
 * Code-split a page: its feature bundle downloads the first time the route is visited.
 * Usage: page(() => import('@/features/x/XPage'), (m) => m.XPage)
 */
function page<M>(load: () => Promise<M>, pick: (module: M) => ComponentType) {
  return { lazy: async () => ({ Component: pick(await importPage(load)) }) };
}

export const router = createBrowserRouter([
  {
    errorElement: <ChunkLoadFallback />,
    children: [
  // The bare URL (e.g. the Vercel link) opens the website
  { path: '/', element: <Navigate to={paths.welcome} replace /> },
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.forgot, element: <ForgotPasswordPage /> },
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
                path: paths.adminKyc,
                ...page(
                  () => import('@/features/admin/AdminKycQueuePage'),
                  (m) => m.AdminKycQueuePage,
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
            element: <CustomerOnly />,
            children: [
              {
                path: paths.verification,
                ...page(
                  () => import('@/features/verification/VerificationPage'),
                  (m) => m.VerificationPage,
                ),
              },
            ],
          },
          // Parked until BudPay airtime/data/electricity is reliable.
          // {
          //   path: paths.payBills,
          //   ...page(
          //     () => import('@/features/bills/BillsPage'),
          //     (m) => m.BillsPage,
          //   ),
          // },
          // Parked until savings/vaults API ships.
          // {
          //   path: paths.savings,
          //   ...page(
          //     () => import('@/features/savings/SavingsPage'),
          //     (m) => m.SavingsPage,
          //   ),
          // },
          // {
          //   path: paths.cards,
          //   ...page(
          //     () => import('@/features/cards/CardsPage'),
          //     (m) => m.CardsPage,
          //   ),
          // },
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
              { path: paths.staff, element: <Navigate to={paths.home} replace /> },
            ],
          },
          {
            element: <CustomerOnly />,
            children: [
              {
                path: paths.notifications,
                ...page(
                  () => import('@/features/inbox/NotificationsPage'),
                  (m) => m.NotificationsPage,
                ),
              },
            ],
          },
          {
            path: paths.rewards,
            ...page(
              () => import('@/features/rewards/RewardsPage'),
              (m) => m.RewardsPage,
            ),
          },
          {
            path: paths.refer,
            ...page(
              () => import('@/features/rewards/ReferPage'),
              (m) => m.ReferPage,
            ),
          },
          {
            path: paths.learn,
            ...page(
              () => import('@/features/learn/LearnPage'),
              (m) => m.LearnPage,
            ),
          },
          {
            path: `${paths.learn}/:slug`,
            ...page(
              () => import('@/features/learn/LearnArticlePage'),
              (m) => m.LearnArticlePage,
            ),
          },
          {
            path: paths.help,
            ...page(
              () => import('@/features/help/HelpPage'),
              (m) => m.HelpPage,
            ),
          },
          {
            path: paths.insights,
            ...page(
              () => import('@/features/insights/InsightsPage'),
              (m) => m.InsightsPage,
            ),
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
                element: <CustomerOnly />,
                children: [
                  {
                    path: 'notifications',
                    ...page(
                      () => import('@/features/settings/NotificationsSettingsPage'),
                      (m) => m.NotificationsSettingsPage,
                    ),
                  },
                ],
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
  { path: paths.terms, element: <LegalPage title="Terms of service" /> },
  { path: paths.privacy, element: <LegalPage title="Privacy policy" /> },
  { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
