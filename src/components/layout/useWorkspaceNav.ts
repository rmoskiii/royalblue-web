import { isStaffRole } from '@/api/types';
import { useAuth } from '@/app/providers/AuthProvider';
import { useProfile } from '@/app/providers/ProfileProvider';
import { navigationFor, navigationForStaff } from './navigation';

export function useWorkspaceNav() {
  const { session } = useAuth();
  const { profileType } = useProfile();
  const role = session?.user.role;
  if (isStaffRole(role)) return navigationForStaff(role);
  return navigationFor(profileType);
}
