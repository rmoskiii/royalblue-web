import { Navigate, Outlet, useLocation } from 'react-router';
import { paths } from '@/components/layout/navigation';
import { useAuth } from './providers/AuthProvider';

/** Sends signed-out users to /login, remembering where they were going. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Keeps signed-in users out of the auth screens. */
export function RedirectIfAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to={paths.home} replace /> : <Outlet />;
}
