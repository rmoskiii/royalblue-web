import { Navigate, Outlet, useLocation } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { LandingPage } from '@/features/landing/LandingPage';
import { useAuth } from './providers/AuthProvider';

/**
 * Signed-out visitors see the public landing page at "/", and are sent to
 * /login (remembering where they were going) for every other app page.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated && location.pathname === paths.home) return <LandingPage />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <Outlet />;
}

/**
 * Keeps signed-in users out of the auth screens. After login, sends them to the
 * page they originally asked for (e.g. a deep link like /loans), else Home.
 */
export function RedirectIfAuthenticated() {
  const { isAuthenticated } = useAuth();
  const from = (useLocation().state as { from?: string } | null)?.from;
  return isAuthenticated ? <Navigate to={from ?? paths.home} replace /> : <Outlet />;
}
