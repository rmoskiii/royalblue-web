import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useVerificationStatus } from '@/api/hooks';
import type { VerificationStepId } from '@/api/types';
import { verificationSteps } from './stepList';
import { VerificationModal } from './VerificationModal';

interface VerificationContextValue {
  /** Opens the flow at `step`, or at the first incomplete step. */
  openVerification: (step?: VerificationStepId) => void;
}

const VerificationContext = createContext<VerificationContextValue | null>(null);

export function VerificationProvider({ children }: { children: ReactNode }) {
  const { data: status } = useVerificationStatus();
  const [startStep, setStartStep] = useState<VerificationStepId | null>(null);

  const openVerification = useCallback(
    (step?: VerificationStepId) => {
      const firstIncomplete = verificationSteps.find(
        (s) => !status?.completedSteps.includes(s.id),
      )?.id;
      setStartStep(step ?? firstIncomplete ?? 'account-type');
    },
    [status],
  );

  const value = useMemo(() => ({ openVerification }), [openVerification]);

  return (
    <VerificationContext.Provider value={value}>
      {children}
      {startStep && (
        <VerificationModal
          key={startStep}
          startStep={startStep}
          onClose={() => setStartStep(null)}
        />
      )}
    </VerificationContext.Provider>
  );
}

export function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) throw new Error('useVerification must be used inside <VerificationProvider>');
  return ctx;
}
