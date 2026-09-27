import { useEffect, useState } from 'react';
import type { SavingsSummary } from '@/api/types';
import { accruedSince } from '../lib/savingsMaths';

/** Interest earned, ticking up every second from the API's snapshot (PRD FR-05). */
export function useLiveInterest(summary: SavingsSummary | undefined) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!summary) return 0;
  return (
    summary.interestEarned +
    accruedSince(summary.totalBalance, summary.annualRate, new Date(summary.asOf).getTime(), now)
  );
}
