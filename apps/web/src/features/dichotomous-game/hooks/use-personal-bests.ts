import { useCallback, useMemo, useState } from 'react';
import { createJsonStore } from '@/lib/storage/json-store';
import { createSafeStorage, namespaced } from '@/lib/storage/safe-storage';

export interface UsePersonalBestsResult {
  /** Mejor tiempo libre en este reto, o `null` si aún no hay ninguno. */
  bestOf(challengeId: string): number | null;
  /** Guarda el tiempo si mejora el anterior. Devuelve si era récord. */
  record(challengeId: string, elapsedMs: number): boolean;
}

/**
 * Mejores tiempos en modo libre, por reto y por dispositivo.
 *
 * Existe para que repetir un reto tenga premio propio: el intento de la
 * clasificación es uno y ya está gastado, pero mejorarse a uno mismo se puede
 * siempre. Se guarda aparte del jugador —y funciona sin registro— porque no
 * tiene nada que ver con la clasificación del evento: es del jugador, no del
 * marcador, y confundir las dos cosas sería prometer algo que no pasa.
 */
export function usePersonalBests(gameSlug: string): UsePersonalBestsResult {
  const store = useMemo(
    () =>
      createJsonStore(namespaced(createSafeStorage('local'), `wk.${gameSlug}`), 'bests', isBestMap),
    [gameSlug]
  );

  const [bests, setBests] = useState<Readonly<Record<string, number>>>(() => store.read() ?? {});

  const record = useCallback(
    (challengeId: string, elapsedMs: number) => {
      const previous = bests[challengeId];
      if (previous !== undefined && previous <= elapsedMs) return false;

      const next = { ...bests, [challengeId]: elapsedMs };
      store.write(next);
      setBests(next);
      return true;
    },
    [bests, store]
  );

  return {
    bestOf: useCallback((challengeId: string) => bests[challengeId] ?? null, [bests]),
    record,
  };
}

/** Descarta lo que haya escrito a mano otra versión del juego en el navegador. */
function isBestMap(value: unknown): value is Record<string, number> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return Object.values(value).every((item) => typeof item === 'number' && item > 0);
}
