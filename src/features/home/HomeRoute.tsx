import { useProfile } from '@/app/providers/ProfileProvider';
import { BusinessDashboardPage } from '@/features/business/BusinessDashboardPage';
import { HomePage } from './HomePage';

/** "/" shows the personal Home or the business dashboard, depending on the active profile. */
export function HomeRoute() {
  return useProfile().profileType === 'business' ? <BusinessDashboardPage /> : <HomePage />;
}
