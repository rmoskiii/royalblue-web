import { Navigate, Outlet, useLocation } from 'react-router';
import { isStaffRole, type StaffRole } from '@/api/types';
import { homePathForRole, paths } from '@/components/layout/navigation';
import { PageLoader } from '@/components/ui';
import { useAuth } from './providers/AuthProvider';

/**
 * Sends signed-out visitors to /login, remembering where they were going.
 */
export function RequireAuth() {
  const { isAuthenticated, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader />;
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

/** Existing sessions after the password-policy cutover cannot use Home or the desk. */
export function RequireStrongPassword() {
  const { session, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader />;
  if (session?.user.mustChangePassword && location.pathname !== paths.updatePassword) {
    return <Navigate to={paths.updatePassword} replace />;
  }
  return <Outlet />;
}

export function RequireStaff() {
  const { session, isAuthenticated, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader />;
  if (!isAuthenticated) {
    return (
      <Navigate
        to={paths.login}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  if (!isStaffRole(session?.user.role)) {
    return <Navigate to={paths.home} replace />;
  }
  return <Outlet />;
}

/** Customer-only pages (inbox, limits). Staff stay on the operations desk. */
export function CustomerOnly() {
  const { session } = useAuth();
  if (isStaffRole(session?.user.role)) {
    return <Navigate to={paths.admin} replace />;
  }
  return <Outlet />;
}

export function RequireStaffRole({ roles }: { roles: StaffRole[] }) {
  const { session } = useAuth();
  if (!isStaffRole(session?.user.role) || !roles.includes(session.user.role)) {
    return <Navigate to={paths.admin} replace />;
  }
  return <Outlet />;
}

/**
 * Keeps signed-in users out of the auth screens. After login, sends them to the
 * page they originally asked for (e.g. a deep link like /loans), else Home.
 */
export function RedirectIfAuthenticated() {
  const { isAuthenticated, session, ready } = useAuth();
  const from = (useLocation().state as { from?: string } | null)?.from;
  if (!ready) return <PageLoader />;
  if (!isAuthenticated) return <Outlet />;
  if (session?.user.mustChangePassword) {
    return <Navigate to={paths.updatePassword} replace />;
  }
  if (from && from !== paths.home) return <Navigate to={from} replace />;
  return <Navigate to={homePathForRole(session?.user.role)} replace />;
}
