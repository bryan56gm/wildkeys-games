import { useMemo } from 'react';
import type { ChallengeDefinition } from '../types';
import { useGameSession } from '../session-context';

/**
 * En qué punto está cada reto para este jugador.
 *
 * - `locked`: aún no se ha ganado el reto que lo abre.
 * - `open`: se puede jugar puntuando; es el intento único del evento.
 * - `running`: empezado y sin terminar. El cronómetro del evento sigue.
 * - `done`: ya competido. Se puede repetir, pero solo para practicar.
 *
 * `open` y `running` solo existen con jugador registrado: sin registro no hay
 * intento que gastar y todo se juega para practicar.
 */
export type ChallengeStage = 'locked' | 'open' | 'running' | 'done';

export interface ChallengeStatus {
  readonly challenge: ChallengeDefinition<string>;
  readonly stage: ChallengeStage;
  /** Reto que hay que ganar para abrirlo; solo cuando está `locked`. */
  readonly unlockedBy: ChallengeDefinition<string> | null;
  /** Tiempo del intento puntuable, ya terminado. */
  readonly elapsedMs: number | null;
  /** Momento en que arrancó el intento en curso. */
  readonly startedAt: number | null;
}

/**
 * El estado de todos los retos del juego, en orden.
 *
 * Vive en un hook y no en la portada porque la portada ya no es una pantalla
 * de novato: lo que ofrece depende de por dónde vaya el jugador, y esa cuenta
 * la hace este sitio y nadie más.
 */
export function useChallengeBoard(): readonly ChallengeStatus[] {
  const { definition, player } = useGameSession();
  const record = player.player;

  return useMemo(
    () =>
      definition.challenges.map((challenge, index) => {
        const previous = index > 0 ? definition.challenges[index - 1]! : null;
        const run = record?.runs[challenge.id];
        const locked =
          challenge.bonus && previous ? record?.runs[previous.id]?.completed !== true : false;

        return {
          challenge,
          stage: stageOf(locked, run?.completed, !!run),
          unlockedBy: locked ? previous : null,
          elapsedMs: run?.elapsedMs ?? null,
          startedAt: run?.startedAt ?? null,
        };
      }),
    [definition.challenges, record]
  );
}

function stageOf(locked: boolean, completed?: boolean, started?: boolean): ChallengeStage {
  if (locked) return 'locked';
  if (completed) return 'done';
  return started ? 'running' : 'open';
}
