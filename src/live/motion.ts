import { useEffect, type RefObject } from 'react';

/**
 * Simulated device motion (#58, 2.5.4). The bar's "Shake the phone" sends `SHAKE_EVENT` to each
 * `[data-shake]` element in the example; an example listens with `useShake`. No device motion
 * sensor is ever read: on this site a shake is always the reader's single press on the bar.
 */

export const SHAKE_EVENT = 'live-shake';

/** Calls `onShake` when the bar shakes the phone. Put `data-shake` on the element `ref` holds. */
export function useShake(ref: RefObject<HTMLElement | null>, onShake: () => void): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener(SHAKE_EVENT, onShake);
    return () => el.removeEventListener(SHAKE_EVENT, onShake);
  }, [ref, onShake]);
}

/** Shakes every `[data-shake]` element under `root`. */
export function shakeWithin(root: Element): void {
  root.querySelectorAll('[data-shake]').forEach((el) => el.dispatchEvent(new Event(SHAKE_EVENT)));
}
