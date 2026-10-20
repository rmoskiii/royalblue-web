function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
  // Same-origin `/api/v1` (Vite proxy, Vercel rewrite). Calling Render from the
  // Vercel origin makes rb.access a third-party cookie; browsers drop it, login
  // looks like it worked, then every follow-up 401s and the app signs out.
  return raw || '/api/v1';
}

/** Typed access to Vite env vars. See .env.example. */
export const env = {
  apiBaseUrl: resolveApiBase(),
  /** Dev defaults to mocks unless VITE_USE_MOCKS=false. Production builds always hit Nest. */
  useMocks: import.meta.env.PROD ? false : import.meta.env.VITE_USE_MOCKS !== 'false',
} as const;
