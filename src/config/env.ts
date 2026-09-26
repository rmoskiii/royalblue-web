/** Typed access to Vite env vars. See .env.example. */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  /** Mocks are on unless VITE_USE_MOCKS is explicitly "false". */
  useMocks: import.meta.env.VITE_USE_MOCKS !== 'false',
} as const;
