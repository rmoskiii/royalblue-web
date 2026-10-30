import { afterEach, describe, expect, it } from 'vitest';
import {
  consumeIdleLockNotice,
  IDLE_LOCK_MS,
  IDLE_LOCK_NOTICE_KEY,
  markIdleLockNotice,
  shouldIdleLock,
} from './idleLock';

describe('shouldIdleLock', () => {
  const lastActivityAt = 1_000_000;

  it('locks a signed-in visible tab after 15 minutes with no activity', () => {
    expect(
      shouldIdleLock({
        signedIn: true,
        visible: true,
        lastActivityAt,
        now: lastActivityAt + IDLE_LOCK_MS,
      }),
    ).toBe(true);
  });

  it('does not lock before 15 minutes', () => {
    expect(
      shouldIdleLock({
        signedIn: true,
        visible: true,
        lastActivityAt,
        now: lastActivityAt + IDLE_LOCK_MS - 1,
      }),
    ).toBe(false);
  });

  it('does not lock a hidden tab, so a closed laptop does not burn the 7-day session', () => {
    expect(
      shouldIdleLock({
        signedIn: true,
        visible: false,
        lastActivityAt,
        now: lastActivityAt + IDLE_LOCK_MS * 8,
      }),
    ).toBe(false);
  });

  it('does not lock when signed out', () => {
    expect(
      shouldIdleLock({
        signedIn: false,
        visible: true,
        lastActivityAt,
        now: lastActivityAt + IDLE_LOCK_MS,
      }),
    ).toBe(false);
  });
});

describe('idle lock notice', () => {
  afterEach(() => {
    sessionStorage.removeItem(IDLE_LOCK_NOTICE_KEY);
  });

  it('surfaces once on the login screen', () => {
    markIdleLockNotice();
    expect(consumeIdleLockNotice()).toBe(true);
    expect(consumeIdleLockNotice()).toBe(false);
  });
});
