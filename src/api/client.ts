import { env } from '@/config/env';
import { friendlyApiMessage } from '@/lib/api-errors';

/**
 * Minimal fetch wrapper. Every service goes through this, so auth headers,
 * error handling and base URL live in one place.
 */

let accessToken: string | null = null;
let activeProfileId: string | null = null;
let onUnauthorized: (() => void) | null = null;
let refreshInFlight: Promise<boolean> | null = null;

const REFRESH_PATH = '/auth/refresh';

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/login/mfa',
  '/auth/mfa/begin',
  '/auth/start',
  '/auth/register',
  '/auth/complete',
  '/auth/identity-lookup',
  '/auth/phone-available',
  '/auth/cac-lookup',
  '/auth/verify-otp',
  '/auth/resend-otp',
  '/auth/otp/send',
  '/auth/otp/verify',
  '/auth/forgot',
  '/auth/forgot/reset',
  '/auth/refresh',
  '/auth/logout',
];

export function setAccessToken(token: string | null) {
  accessToken = token;
}

/** AuthProvider registers this so a dead JWT drops the session instead of trapping the dashboard. */
export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

/**
 * Personal vs business profile (PRD FR-04). Sent on every request so the API
 * can scope merchant views. Nest currently uses the JWT applicant; the header
 * is reserved for a dedicated profile switcher.
 */
export function setActiveProfileId(id: string | null) {
  activeProfileId = id;
}

export function getActiveProfileId() {
  return activeProfileId;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type Query = Record<string, string | number | boolean | undefined>;

interface RequestOptions {
  query?: Query;
  /** Sent as JSON */
  json?: unknown;
  /** Sent as multipart/form-data (file uploads) */
  form?: FormData;
  signal?: AbortSignal;
}

function errorMessage(data: unknown, status: number): string {
  const body = data as { message?: unknown } | undefined;
  const message = body?.message;
  if (Array.isArray(message)) return message.map(String).join(', ');
  if (typeof message === 'string' && message) return message;
  return `Request failed (${status})`;
}

async function refreshAccessToken(): Promise<boolean> {
  const url = new URL(`${env.apiBaseUrl}${REFRESH_PATH}`, window.location.origin);
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    await res.json().catch(() => undefined);
    return false;
  }
  return true;
}

function refreshOnce(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

async function request<T>(
  method: string,
  path: string,
  { query, json, form, signal }: RequestOptions = {},
  retried = false,
): Promise<T> {
  const url = new URL(`${env.apiBaseUrl}${path}`, window.location.origin);
  Object.entries(query ?? {}).forEach(
    ([k, v]) => v !== undefined && url.searchParams.set(k, String(v)),
  );

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: 'include',
      signal,
      headers: {
        Accept: 'application/json',
        ...(json !== undefined && { 'Content-Type': 'application/json' }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(activeProfileId && { 'X-Profile-Id': activeProfileId }),
      },
      body: form ?? (json !== undefined ? JSON.stringify(json) : undefined),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw error;
  }

  const data = res.status === 204 ? undefined : await res.json().catch(() => undefined);

  if (!res.ok) {
    const message = errorMessage(data, res.status);
    const canRefresh =
      res.status === 401 &&
      !retried &&
      path !== REFRESH_PATH &&
      !PUBLIC_AUTH_PATHS.includes(path) &&
      !/pin|unauthorized access|payout/i.test(message);
    if (canRefresh && (await refreshOnce())) {
      return request<T>(method, path, { query, json, form, signal }, true);
    }
    // Wrong PIN and payout-provider 403s used to return 401/"Unauthorized Access"
    // and this handler treated them as a dead JWT.
    const sessionExpired =
      res.status === 401 &&
      !PUBLIC_AUTH_PATHS.includes(path) &&
      !/pin|unauthorized access|payout/i.test(message);
    if (sessionExpired) {
      onUnauthorized?.();
    }
    throw new ApiError(res.status, friendlyApiMessage(message, res.status, path), data);
  }
  return data as T;
}

export const http = {
  get: <T>(path: string, query?: Query, signal?: AbortSignal) =>
    request<T>('GET', path, { query, signal }),
  post: <T>(path: string, json?: unknown) => request<T>('POST', path, { json }),
  patch: <T>(path: string, json?: unknown) => request<T>('PATCH', path, { json }),
  put: <T>(path: string, json?: unknown) => request<T>('PUT', path, { json }),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, form: FormData) => request<T>('POST', path, { form }),
  async blob(path: string) {
    const url = new URL(`${env.apiBaseUrl}${path}`, window.location.origin);
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        ...(activeProfileId && { 'X-Profile-Id': activeProfileId }),
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => undefined);
      throw new ApiError(
        res.status,
        friendlyApiMessage(errorMessage(data, res.status), res.status, path),
        data,
      );
    }
    return res.blob();
  },
};

/** Resolve mock data after a short delay so loading states are visible in dev. */
export function mockResponse<T>(data: T, ms = 350, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(structuredClone(data)), ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      },
      { once: true },
    );
  });
}
