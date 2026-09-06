import { useCallback } from 'react';
import { useLeaderboardService } from '@wkg/leaderboard';
import type { GameDefinition } from '../types';

/**
 * Comprueba si un nombre ya está en la clasificación.
 *
 * Se resuelve contra lo que hay en caché (snapshot y cola local): es
 * instantáneo, funciona sin red y basta para evitar el choque evidente de dos
 * equipos con el mismo nombre en el evento. No es una restricción de unicidad
 * — esa no existe a propósito, ver el ADR 003.
 */
export function useNicknameTaken<C extends string>(
  definition: GameDefinition<C>
): (nickname: string) => boolean {
  const service = useLeaderboardService();

  return useCallback(
    (nickname: string) => {
      const normalised = nickname.trim().toLocaleLowerCase();
      if (!normalised) return false;

      const cached = definition.challenges.flatMap(
        (challenge) =>
          service.readCached({ gameSlug: definition.slug, challenge: challenge.id })?.entries ?? []
      );
      const queued = service.pending().filter((item) => item.gameSlug === definition.slug);
      const demo = definition.demoScores ?? [];

      return (
        [...cached, ...queued].some((entry) => entry.nickname.toLocaleLowerCase() === normalised) ||
        demo.some((entry) => entry.name.toLocaleLowerCase() === normalised)
      );
    },
    [definition, service]
  );
}
