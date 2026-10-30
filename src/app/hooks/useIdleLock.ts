import { useEffect, useRef } from 'react';
import { shouldIdleLock } from '@/lib/idleLock';

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel'] as const;

/** Signs the user out after 15 minutes on a visible tab with no interaction. Hidden tabs do not count. */
export function useIdleLock(signedIn: boolean, onIdle: () => void) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    if (!signedIn) return;
    let lastActivityAt = Date.now();
    const mark = () => {
      lastActivityAt = Date.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') mark();
    };
    const tick = () => {
      if (
        shouldIdleLock({
          signedIn: true,
          visible: document.visibilityState === 'visible',
          lastActivityAt,
          now: Date.now(),
        })
      ) {
        onIdleRef.current();
      }
    };
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, mark, { capture: true, passive: true });
    }
    document.addEventListener('visibilitychange', onVisibility);
    const timer = window.setInterval(tick, 15_000);
    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, mark, { capture: true });
      }
      document.removeEventListener('visibilitychange', onVisibility);
      window.clearInterval(timer);
    };
  }, [signedIn]);
}
