import { Navigate, Outlet } from 'react-router';
import { useProfile } from '@/app/providers/ProfileProvider';
import { paths } from '@/components/layout/navigation';

/** Merchant pages only exist on the business profile. */
export function BusinessOnly() {
  const { profileType } = useProfile();
  return profileType === 'business' ? <Outlet /> : <Navigate to={paths.home} replace />;
}
