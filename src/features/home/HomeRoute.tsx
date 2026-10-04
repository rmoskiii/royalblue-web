import { Navigate } from 'react-router';
import { isStaffRole } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProfile } from '@/app/providers/ProfileProvider';
import { paths } from '@/components/layout/navigation';
import { BusinessDashboardPage } from '@/features/business/BusinessDashboardPage';
import { HomePage } from './HomePage';

/** Customers see Home. Staff are sent to the operations desk. */
export function HomeRoute() {
  const { session } = useAuth();
  if (isStaffRole(session?.user.role)) return <Navigate to={paths.admin} replace />;
  return useProfile().profileType === 'business' ? <BusinessDashboardPage /> : <HomePage />;
}
