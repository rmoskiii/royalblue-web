import { env } from '@/config/env';

/**
 * Minimal fetch wrapper. Every service goes through this, so auth headers,
 * error handling and base URL live in one place.
 */

let accessToken: string | null = null;
let activeProfileId: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
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
}

function errorMessage(data: unknown, status: number): string {
  const body = data as { message?: unknown } | undefined;
  const message = body?.message;
  if (Array.isArray(message)) return message.map(String).join(', ');
  if (typeof message === 'string' && message) return message;
  return `Request failed (${status})`;
}

async function request<T>(
  method: string,
  path: string,
  { query, json, form }: RequestOptions = {},
): Promise<T> {
  const url = new URL(`${env.apiBaseUrl}${path}`, window.location.origin);
  Object.entries(query ?? {}).forEach(
    ([k, v]) => v !== undefined && url.searchParams.set(k, String(v)),
  );

  const res = await fetch(url, {
    method,
    headers: {
      Accept: 'application/json',
      ...(json !== undefined && { 'Content-Type': 'application/json' }),
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(activeProfileId && { 'X-Profile-Id': activeProfileId }),
    },
    body: form ?? (json !== undefined ? JSON.stringify(json) : undefined),
  });

  const data = res.status === 204 ? undefined : await res.json().catch(() => undefined);

  if (!res.ok) {
    throw new ApiError(res.status, errorMessage(data, res.status), data);
  }
  return data as T;
}

export const http = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, { query }),
  post: <T>(path: string, json?: unknown) => request<T>('POST', path, { json }),
  put: <T>(path: string, json?: unknown) => request<T>('PUT', path, { json }),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, form: FormData) => request<T>('POST', path, { form }),
};

/** Resolve mock data after a short delay so loading states are visible in dev. */
export function mockResponse<T>(data: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(data)), ms));
}
