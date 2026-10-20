/**
 * Browser security headers for the SPA. Production CSP is strict: no inline
 * scripts, no framing, connect only to same origin (Vercel /api rewrite).
 * `style-src-attr` allows React `style={{}}` without opening `<style>` XSS.
 */
export const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "style-src-attr 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' blob: data:",
  "media-src 'self' blob:",
  "connect-src 'self'",
  "frame-src 'none'",
  "worker-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

/** Vite HMR needs eval and a websocket. Never send this policy from Vercel. */
export const developmentCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' blob: data:",
  "media-src 'self' blob:",
  "connect-src 'self' ws: wss: http://localhost:* http://127.0.0.1:*",
  "frame-src 'none'",
].join('; ');

export const permissionsPolicy = [
  'camera=(self)',
  'microphone=()',
  'geolocation=()',
  'payment=()',
  'usb=()',
  'interest-cohort=()',
].join(', ');

export function browserSecurityHeaders(csp: string, https = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Security-Policy': csp,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': permissionsPolicy,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'X-Permitted-Cross-Domain-Policies': 'none',
  };
  if (https) {
    headers['Strict-Transport-Security'] = 'max-age=63072000; includeSubDomains; preload';
  }
  return headers;
}
