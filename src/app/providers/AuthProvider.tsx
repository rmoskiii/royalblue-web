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
import { storage } from '@/lib/storage';

const SESSION_KEY = 'rb.session';

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  establishSession: (session: Session) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadSession(): Session | null {
  const raw = storage.get(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw) as Session;
    setAccessToken(session.accessToken);
    return session;
  } catch {
    return null;
  }
}

/**
 * Holds the signed-in session.
 * TODO(api): confirm token storage with the backend team — an httpOnly cookie
 * is safer than localStorage for a banking app if the API supports it.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);
  const queryClient = useQueryClient();

  const establishSession = useCallback((next: Session) => {
    setAccessToken(next.accessToken);
    storage.set(SESSION_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const next = await authService.login({ identifier, password });
    if ('mfaRequired' in next && next.mfaRequired) {
      throw new Error('Authenticator code required');
    }
    if (!('accessToken' in next)) {
      throw new Error('Authenticator code required');
    }
    establishSession(next);
  }, [establishSession]);

  const logout = useCallback(() => {
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

  useEffect(() => {
    setOnUnauthorized(logout);
    return () => setOnUnauthorized(null);
  }, [logout]);

  const value = useMemo(
    () => ({ session, isAuthenticated: Boolean(session), login, establishSession, logout }),
    [session, login, establishSession, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
