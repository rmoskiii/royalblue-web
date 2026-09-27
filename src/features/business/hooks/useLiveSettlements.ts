import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { queryKeys, useSettlements } from '@/api/hooks';
import { businessService } from '@/api/services/business';
import type { BusinessSummary, Settlement } from '@/api/types';

/**
 * Settlements list that updates in real time (PRD View 2). New payments are
 * prepended to the cached list and added to today's volume / pending payout.
 * `freshIds` lets the table highlight rows that just arrived.
 */
export function useLiveSettlements() {
  const queryClient = useQueryClient();
  const query = useSettlements();
  const [freshIds, setFreshIds] = useState<string[]>([]);

  useEffect(() => {
    return businessService.subscribeToSettlements((s: Settlement) => {
      queryClient.setQueryData<Settlement[]>(queryKeys.business.settlements, (list = []) => [
        s,
        ...list,
      ]);
      queryClient.setQueryData<BusinessSummary>(queryKeys.business.summary, (summary) =>
        summary
          ? {
              ...summary,
              todayVolume: summary.todayVolume + s.amount,
              pendingPayout: summary.pendingPayout + (s.status === 'pending' ? s.amount : 0),
            }
          : summary,
      );
      setFreshIds((ids) => [s.id, ...ids].slice(0, 5));
      window.setTimeout(() => setFreshIds((ids) => ids.filter((id) => id !== s.id)), 4_000);
    });
  }, [queryClient]);

  return { ...query, freshIds };
}
