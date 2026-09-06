import { useCallback, useMemo, useState } from 'react';
import { createJsonStore } from '@/lib/storage/json-store';
import { createSafeStorage, namespaced } from '@/lib/storage/safe-storage';

/** Intento del jugador en un reto concreto. */
export interface ChallengeRun {
  /** Momento en que arrancó el cronómetro. */
  readonly startedAt: number;
  readonly completed: boolean;
  readonly elapsedMs: number | null;
  readonly fails: number;
}

/**
 * El único jugador registrado en este dispositivo. Es lo que hace cumplir la
 * regla del evento: un intento puntuable por móvil y por reto.
 */
export interface PlayerRecord {
  readonly nickname: string;
  readonly runs: Readonly<Record<string, ChallengeRun>>;
}

export interface UsePlayerResult {
  readonly player: PlayerRecord | null;
  /** Da de alta al jugador y arranca su primer intento puntuable. */
  register(nickname: string, challengeId: string): PlayerRecord;
  /** Arranca un intento puntuable de otro reto (el extra). */
  startRun(challengeId: string): PlayerRecord | null;
  /** Cierra un intento con su tiempo y sus fallos. */
  completeRun(challengeId: string, elapsedMs: number, fails: number): PlayerRecord | null;
  /** Reto puntuable empezado y sin terminar, si lo hay. */
  pendingChallengeId(): string | null;
}

/** Estado del jugador persistido por juego, aislado del resto de la plataforma. */
export function usePlayer(gameSlug: string): UsePlayerResult {
  const store = useMemo(
    () =>
      createJsonStore(
        namespaced(createSafeStorage('local'), `wk.${gameSlug}`),
        'player',
        isPlayerRecord
      ),
    [gameSlug]
  );

  const [player, setPlayer] = useState<PlayerRecord | null>(() => store.read());

  const persist = useCallback(
    (next: PlayerRecord) => {
      store.write(next);
      setPlayer(next);
      return next;
    },
    [store]
  );

  const register = useCallback(
    (nickname: string, challengeId: string) =>
      persist({ nickname: nickname.trim(), runs: { [challengeId]: newRun() } }),
    [persist]
  );

  const startRun = useCallback(
    (challengeId: string) => {
      if (!player || player.runs[challengeId]) return player;
      return persist({ ...player, runs: { ...player.runs, [challengeId]: newRun() } });
    },
    [persist, player]
  );

  const completeRun = useCallback(
    (challengeId: string, elapsedMs: number, fails: number) => {
      const run = player?.runs[challengeId];
      if (!player || !run || run.completed) return player;
      return persist({
        ...player,
        runs: { ...player.runs, [challengeId]: { ...run, completed: true, elapsedMs, fails } },
      });
    },
    [persist, player]
  );

  const pendingChallengeId = useCallback(() => {
    const entry = Object.entries(player?.runs ?? {}).find(([, run]) => !run.completed);
    return entry?.[0] ?? null;
  }, [player]);

  return { player, register, startRun, completeRun, pendingChallengeId };
}

function newRun(): ChallengeRun {
  return { startedAt: Date.now(), completed: false, elapsedMs: null, fails: 0 };
}

/** Descarta datos de otra versión o manipulados a mano en el navegador. */
function isPlayerRecord(value: unknown): value is PlayerRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as { nickname?: unknown; runs?: unknown };
  if (
    typeof record.nickname !== 'string' ||
    typeof record.runs !== 'object' ||
    record.runs === null
  )
    return false;

  return Object.values(record.runs as Record<string, unknown>).every((run) => {
    if (typeof run !== 'object' || run === null) return false;
    const candidate = run as Record<string, unknown>;
    return (
      typeof candidate['startedAt'] === 'number' && typeof candidate['completed'] === 'boolean'
    );
  });
}
