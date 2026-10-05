'use client';

import { useSyncExternalStore } from 'react';

/**
 * Devuelve si la media query coincide. En el servidor y en el primer render
 * del cliente devuelve false, así la hidratación nunca difiere del HTML.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
