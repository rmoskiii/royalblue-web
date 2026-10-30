import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/api/services/auth';
import { setAccessToken, setActiveProfileId, setOnUnauthorized } from '@/api/client';
import type { Session } from '@/api/types';
import { useIdleLock } from '@/app/hooks/useIdleLock';
import { markIdleLockNotice } from '@/lib/idleLock';
import { storage } from '@/lib/storage';

const SESSION_KEY = 'rb.session';

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  ready: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  establishSession: (session: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Session user lives in memory. Access and refresh JWTs are httpOnly cookies
 * on the API host (Vite has no Next.js server to encrypt localStorage).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  const establishSession = useCallback((next: Session) => {
    setSession({ user: next.user });
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const next = await authService.login({ identifier, password });
      if ('mfaRequired' in next && next.mfaRequired) {
        throw new Error('Authenticator code required');
      }
      if (!('user' in next) || !next.user) {
        throw new Error('Authenticator code required');
      }
      establishSession(next);
    },
    [establishSession],
  );

  const logout = useCallback(() => {
    void authService.logout();
    setAccessToken(null);
    setActiveProfileId(null);
    storage.remove(SESSION_KEY);
    storage.remove('rb.profile');
    try {
      sessionStorage.removeItem('rb.signup.draft');
    } catch {
      /* ignore */
    }
    queryClient.clear();
    setSession(null);
  }, [queryClient]);

  const lockForIdle = useCallback(() => {
    markIdleLockNotice();
    logout();
  }, [logout]);

  useIdleLock(Boolean(session), lockForIdle);

  useEffect(() => {
    storage.remove(SESSION_KEY);
    setOnUnauthorized(logout);
    let cancelled = false;
    void (async () => {
      try {
        const user = await authService.me();
        if (!cancelled) setSession({ user });
      } catch {
        // A 401 here is "not signed in". Do not clear a login that finished
        // while this bootstrap request was still in flight.
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      setOnUnauthorized(null);
    };
  }, [logout]);

  const value = useMemo(
    () => ({
      session,
      isAuthenticated: Boolean(session),
      ready,
      login,
      establishSession,
      logout,
    }),
    [session, ready, login, establishSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
