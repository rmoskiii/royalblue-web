import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { authService } from '@/api/services/auth';
import { setAccessToken } from '@/api/client';
import type { Session } from '@/api/types';
import { storage } from '@/lib/storage';

const SESSION_KEY = 'rb.session';

interface AuthContextValue {
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
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

  const login = useCallback(async (email: string, password: string) => {
    const next = await authService.login({ email, password });
    setAccessToken(next.accessToken);
    storage.set(SESSION_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const logout = useCallback(() => {
    setAccessToken(null);
    storage.remove(SESSION_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, isAuthenticated: Boolean(session), login, logout }),
    [session, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
