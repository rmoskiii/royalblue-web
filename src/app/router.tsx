import { createBrowserRouter } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { comingSoon, paths } from '@/components/layout/navigation';
import { CreatePasswordPage } from '@/features/auth/CreatePasswordPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { VerifyEmailPage } from '@/features/auth/VerifyEmailPage';
import { HomePage } from '@/features/home/HomePage';
import { LoansPage } from '@/features/loans/LoansPage';
import { ComingSoonPage } from '@/features/misc/ComingSoonPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { TransactionsPage } from '@/features/transactions/TransactionsPage';
import { TransferPage } from '@/features/transfer/TransferPage';
import { RedirectIfAuthenticated, RequireAuth } from './guards';

export const router = createBrowserRouter([
  {
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: paths.login, element: <LoginPage /> },
          { path: paths.signUp, element: <SignUpPage /> },
          { path: paths.verifyEmail, element: <VerifyEmailPage /> },
          { path: paths.createPassword, element: <CreatePasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: paths.transfer, element: <TransferPage /> },
          { path: paths.loans, element: <LoansPage /> },
          { path: paths.transactions, element: <TransactionsPage /> },
          ...comingSoon.map((item) => ({ path: item.to, element: <ComingSoonPage item={item} /> })),
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
