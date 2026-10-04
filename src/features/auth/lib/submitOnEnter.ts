import { useEffect, useRef, type KeyboardEvent, type RefObject } from 'react';

/** Enter submits the current onboarding form unless a type=button (Resend, skip, Back) is focused. */
export function submitOnEnter(e: KeyboardEvent<HTMLFormElement>) {
  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
  const target = e.target as HTMLElement | null;
  if (!target || target.tagName === 'TEXTAREA') return;
  const control = target.closest('button, input');
  if (control instanceof HTMLButtonElement && control.type !== 'submit') return;
  e.preventDefault();
  e.currentTarget.requestSubmit();
}

/**
 * Enter on picker/confirm screens where nothing is typed.
 * Armed after a short delay so the previous step’s Enter cannot skip this one.
 */
export function useEnterToSubmit(): RefObject<HTMLFormElement | null> {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    let armed = false;
    const arm = window.setTimeout(() => {
      armed = true;
    }, 250);
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (!armed || e.key !== 'Enter' || e.isComposing) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('button[type="button"], a, textarea')) return;
      e.preventDefault();
      ref.current?.requestSubmit();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(arm);
      window.removeEventListener('keydown', onKey);
    };
  }, []);
  return ref;
}
