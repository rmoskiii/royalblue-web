import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getSavedTheme,
  getSystemTheme,
  type Theme,
} from '@/lib/theme';
import { storage } from '@/lib/storage';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Light / deep-purple dark theme. Follows the device setting until the user
 * picks one; the choice is saved in localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getSavedTheme() ?? getSystemTheme());

  useEffect(() => applyTheme(theme), [theme]);

  // Keep following the OS setting while the user hasn't chosen explicitly.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!getSavedTheme()) setThemeState(mq.matches ? 'dark' : 'light');
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    storage.set(THEME_STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark') }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
