import { useCallback, useEffect, useState } from 'react';
import { mergeWithPending, withRanks } from '../ranking.js';
import type { LeaderboardQuery, ScoreEntry } from '../types.js';
import { useLeaderboardService } from './context.js';

/** De dónde salen las marcas que se están viendo. */
export type LeaderboardSource = 'loading' | 'live' | 'cached' | 'disabled';

export interface UseLeaderboardResult {
  readonly entries: readonly (ScoreEntry & { rank: number })[];
  readonly source: LeaderboardSource;
  /** Instante de la última sincronización correcta, si la hubo. */
  readonly fetchedAt: number | null;
  refresh(): void;
}

/**
 * Clasificación de un reto, en vivo cuando hay red y desde el último snapshot
 * cuando no la hay. Las marcas propias todavía en cola se muestran igualmente,
 * para que el jugador nunca deje de verse.
 */
export function useLeaderboard(query: LeaderboardQuery): UseLeaderboardResult {
  const service = useLeaderboardService();
  const { gameSlug, challenge, limit } = query;

  const [entries, setEntries] = useState<readonly ScoreEntry[]>([]);
  const [source, setSource] = useState<LeaderboardSource>(service.enabled ? 'loading' : 'disabled');
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    const request: LeaderboardQuery =
      limit === undefined ? { gameSlug, challenge } : { gameSlug, challenge, limit };
    let active = true;

    /*
     * `as` dice por qué se está pintando lo cacheado. Antes siempre marcaba
     * `cached`, también en el instante entre pedir y recibir —y cambiar de
     * reto vuelve a pasar por ahí—, así que el marcador anunciaba «sin
     * conexión» durante un parpadeo aunque la hubiera.
     */
    const applyCache = (as: 'loading' | 'cached') => {
      const cached = service.readCached(request);
      if (!active) return;
      setEntries(cached?.entries ?? []);
      setFetchedAt(cached?.fetchedAt ?? null);
      setSource(service.enabled ? as : 'disabled');
    };

    const load = () => {
      if (!service.enabled) {
        applyCache('cached');
        return;
      }
      service
        .fetchTop(request)
        .then((fresh) => {
          if (!active) return;
          setEntries(fresh);
          setFetchedAt(Date.now());
          setSource('live');
        })
        .catch(() => applyCache('cached'));
    };

    applyCache('loading'); // pinta algo de inmediato, luego se refresca
    load();

    const unsubscribe = service.subscribe(request, load);
    return () => {
      active = false;
      unsubscribe();
    };
  }, [service, gameSlug, challenge, limit, reloadToken]);

  return {
    entries: withRanks(
      mergeWithPending(entries, pendingFor(service.pending(), gameSlug, challenge))
    ),
    source,
    fetchedAt,
    refresh,
  };
}

function pendingFor<T extends { gameSlug: string; challenge: string }>(
  items: readonly T[],
  gameSlug: string,
  challenge: string
): readonly T[] {
  return items.filter((item) => item.gameSlug === gameSlug && item.challenge === challenge);
}
