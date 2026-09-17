import { useCallback, useMemo, useState } from 'react';
import type { TrailStep } from '@wkg/game-engine';
import { createJsonStore } from '@/lib/storage/json-store';
import { createSafeStorage, namespaced } from '@/lib/storage/safe-storage';

export interface UseSolvedPathsResult {
  /** Recorrido con el que se resolvió el reto, o `null` si aún no se resolvió. */
  pathOf(challengeId: string): readonly TrailStep[] | null;
  remember(challengeId: string, trail: readonly TrailStep[]): void;
}

/**
 * El camino con el que se resolvió cada reto, para poder repasarlo después.
 *
 * Se guardan los pasos —nodo y opción elegida—, no las frases: los textos
 * salen de la clave al mostrarlos, así que el recorrido se lee en el idioma
 * que tenga puesto el jugador ahora y no en el que jugó, y no se queda viejo
 * si mañana se corrige una descripción de la clave.
 */
export function useSolvedPaths(gameSlug: string): UseSolvedPathsResult {
  const store = useMemo(
    () =>
      createJsonStore(namespaced(createSafeStorage('local'), `wk.${gameSlug}`), 'paths', isPathMap),
    [gameSlug]
  );

  const [paths, setPaths] = useState<Readonly<Record<string, readonly TrailStep[]>>>(
    () => store.read() ?? {}
  );

  const remember = useCallback(
    (challengeId: string, trail: readonly TrailStep[]) => {
      const next = { ...paths, [challengeId]: trail };
      store.write(next);
      setPaths(next);
    },
    [paths, store]
  );

  return {
    pathOf: useCallback((challengeId: string) => paths[challengeId] ?? null, [paths]),
    remember,
  };
}

/** Descarta lo que haya escrito a mano otra versión del juego en el navegador. */
function isPathMap(value: unknown): value is Record<string, readonly TrailStep[]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  return Object.values(value).every(
    (trail) =>
      Array.isArray(trail) &&
      trail.every((step: unknown) => {
        if (typeof step !== 'object' || step === null) return false;
        const candidate = step as Record<string, unknown>;
        return (
          typeof candidate['nodeId'] === 'string' && typeof candidate['optionIndex'] === 'number'
        );
      })
  );
}
