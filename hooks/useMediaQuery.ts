'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reactively track a CSS media query (e.g. `'(pointer: coarse)'`).
 *
 * Components whose LAYOUT MATH depends on a media feature (a JS-computed
 * grid track, an inline-action budget) can't express it in CSS alone —
 * this hook is the one owner for that. SSR-safe: `false` on the server.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
