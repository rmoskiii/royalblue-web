import { storage } from './storage';

export type Theme = 'light' | 'dark';

/** Must match the key used by the inline script in index.html */
export const THEME_STORAGE_KEY = 'rb.theme';

export function getSavedTheme(): Theme | null {
  const saved = storage.get(THEME_STORAGE_KEY);
  return saved === 'light' || saved === 'dark' ? saved : null;
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0D0C20' : '#1B194D');
}
