import { env } from '@/config/env';

/**
 * Approve a transaction with the device's biometrics via WebAuthn (PRD FR-08).
 * Returns an assertion string to send with the request.
 *
 * TODO(api): needs a challenge from the backend (and a registered passkey).
 * Flow: GET challenge → navigator.credentials.get({ publicKey }) → send the
 * serialised assertion with the transfer request.
 */
export async function approveWithPasskey(): Promise<string> {
  if (!window.PublicKeyCredential) {
    throw new Error('This browser doesn’t support passkeys. Use your PIN instead.');
  }
  if (env.useMocks) {
    await new Promise((r) => setTimeout(r, 700));
    return 'mock-passkey-assertion';
  }
  throw new Error('Passkey approval isn’t connected yet. Use your PIN instead.');
}
