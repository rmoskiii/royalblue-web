const HOSTED_API = 'https://royalblue-api.onrender.com/api/v1';

function resolveApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
  if (import.meta.env.PROD && (!raw || raw.startsWith('/'))) {
    return HOSTED_API;
  }
  return raw || '/api/v1';
}

/** Typed access to Vite env vars. See .env.example. */
export const env = {
  apiBaseUrl: resolveApiBase(),
  /** Dev defaults to mocks unless VITE_USE_MOCKS=false. Production builds always hit Nest. */
  useMocks: import.meta.env.PROD ? false : import.meta.env.VITE_USE_MOCKS !== 'false',
} as const;
