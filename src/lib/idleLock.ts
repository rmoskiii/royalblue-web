/** Foreground inactivity before we drop the session and ask for the password again. */
export const IDLE_LOCK_MS = 15 * 60 * 1000;

export const IDLE_LOCK_NOTICE_KEY = 'rb.idleLock';

export function shouldIdleLock(input: {
  signedIn: boolean;
  visible: boolean;
  lastActivityAt: number;
  now: number;
  idleMs?: number;
}): boolean {
  if (!input.signedIn || !input.visible) return false;
  return input.now - input.lastActivityAt >= (input.idleMs ?? IDLE_LOCK_MS);
}

export function markIdleLockNotice() {
  try {
    sessionStorage.setItem(IDLE_LOCK_NOTICE_KEY, '1');
  } catch {
    /* private mode */
  }
}

export function consumeIdleLockNotice(): boolean {
  try {
    if (sessionStorage.getItem(IDLE_LOCK_NOTICE_KEY) !== '1') return false;
    sessionStorage.removeItem(IDLE_LOCK_NOTICE_KEY);
    return true;
  } catch {
    return false;
  }
}
