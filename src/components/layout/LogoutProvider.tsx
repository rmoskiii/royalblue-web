import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button, Modal } from '@/components/ui';

const LogoutUiContext = createContext<{ requestLogout: () => void } | null>(null);

/** Shared “Are you sure?” for sidebar, profile switcher, and More. */
export function LogoutProvider({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const requestLogout = useCallback(() => setOpen(true), []);

  return (
    <LogoutUiContext.Provider value={{ requestLogout }}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} title="Log out?">
        <div className="px-4.5 pt-1 pb-5">
          <p className="text-sm text-ink-3">Are you sure you want to log out?</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </Modal>
    </LogoutUiContext.Provider>
  );
}

export function useLogoutConfirm() {
  const ctx = useContext(LogoutUiContext);
  if (!ctx) throw new Error('useLogoutConfirm must be used inside <LogoutProvider>');
  return ctx;
}
