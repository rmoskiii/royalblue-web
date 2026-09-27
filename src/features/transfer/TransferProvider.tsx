import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Beneficiary } from '@/api/types';
import { TransferModal } from './components/TransferModal';

interface TransferContextValue {
  /** Opens the transfer modal, optionally pre-filled with a beneficiary. */
  openTransfer: (beneficiary?: Beneficiary) => void;
}

const TransferContext = createContext<TransferContextValue | null>(null);

export function TransferProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<{ id: number; beneficiary?: Beneficiary } | null>(null);

  const openTransfer = useCallback(
    (beneficiary?: Beneficiary) => setSession({ id: Date.now(), beneficiary }),
    [],
  );
  const value = useMemo(() => ({ openTransfer }), [openTransfer]);

  return (
    <TransferContext.Provider value={value}>
      {children}
      {session && (
        <TransferModal
          key={session.id}
          initial={session.beneficiary}
          onClose={() => setSession(null)}
        />
      )}
    </TransferContext.Provider>
  );
}

export function useTransfer() {
  const ctx = useContext(TransferContext);
  if (!ctx) throw new Error('useTransfer must be used inside <TransferProvider>');
  return ctx;
}
