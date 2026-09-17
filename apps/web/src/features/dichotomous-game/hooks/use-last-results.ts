import { useCallback, useMemo, useState } from 'react';
import type { TrailStep } from '@wkg/game-engine';
import { createJsonStore } from '@/lib/storage/json-store';
import { createSafeStorage, namespaced } from '@/lib/storage/safe-storage';

/** Lo que hay que saber de un reto ya ganado para poder volver a enseñarlo. */
export interface ChallengeResult {
  readonly elapsedMs: number;
  readonly fails: number;
  /** El intento puntuaba para la clasificación del evento. */
  readonly scored: boolean;
  readonly trail: readonly TrailStep[];
  /** Batió el récord personal en modo libre. */
  readonly beatenBest: boolean;
}

export interface UseLastResultsResult {
  resultOf(challengeId: string): ChallengeResult | null;
  remember(challengeId: string, result: ChallengeResult): void;
}

/**
 * El resultado de la última partida ganada de cada reto.
 *
 * Existe para que la pantalla final sobreviva a una recarga. Antes vivía solo
 * en memoria: recargar en la pantalla de victoria la borraba, la ruta de la
 * partida no encontraba nada y arrancaba una **nueva** con el cronómetro
 * corriendo — con lo que el jugador pasaba de haber terminado a estar jugando
 * sin haber tocado nada.
 */
export function useLastResults(gameSlug: string): UseLastResultsResult {
  const store = useMemo(
    () =>
      createJsonStore(
        namespaced(createSafeStorage('local'), `wk.${gameSlug}`),
        'results',
        isResultMap
      ),
    [gameSlug]
  );

  const [results, setResults] = useState<Readonly<Record<string, ChallengeResult>>>(
    () => store.read() ?? {}
  );

  const remember = useCallback(
    (challengeId: string, result: ChallengeResult) => {
      const next = { ...results, [challengeId]: result };
      store.write(next);
      setResults(next);
    },
    [results, store]
  );

  return {
    resultOf: useCallback((challengeId: string) => results[challengeId] ?? null, [results]),
    remember,
  };
}

/** Descarta lo que haya escrito a mano otra versión del juego en el navegador. */
function isResultMap(value: unknown): value is Record<string, ChallengeResult> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;

  return Object.values(value).every((result) => {
    if (typeof result !== 'object' || result === null) return false;
    const candidate = result as Record<string, unknown>;
    return (
      typeof candidate['elapsedMs'] === 'number' &&
      typeof candidate['fails'] === 'number' &&
      Array.isArray(candidate['trail'])
    );
  });
}
