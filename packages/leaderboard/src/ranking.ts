import type { PendingScore, ScoreEntry } from './types.js';

/**
 * Orden de la clasificación: menos tiempo primero; a igualdad, menos fallos;
 * y a igualdad total, quien la registró antes.
 */
export function compareEntries(a: ScoreEntry, b: ScoreEntry): number {
  return a.elapsedMs - b.elapsedMs || a.fails - b.fails || a.createdAt.localeCompare(b.createdAt);
}

/**
 * Une la clasificación publicada con las marcas propias aún sin sincronizar,
 * de modo que el jugador se ve en el marcador aunque no haya red. Todo lo que
 * está en cola lo generó este dispositivo, así que entra marcado como propio;
 * si una pendiente ya subió (mismo reto, nombre, tiempo y fallos) no se
 * duplica.
 */
export function mergeWithPending(
  entries: readonly ScoreEntry[],
  pending: readonly PendingScore[]
): readonly ScoreEntry[] {
  const published = new Set(entries.map(fingerprint));

  const provisional = pending
    .map<ScoreEntry>((item) => ({
      id: item.localId,
      gameSlug: item.gameSlug,
      challenge: item.challenge,
      nickname: item.nickname,
      elapsedMs: item.elapsedMs,
      fails: item.fails,
      createdAt: new Date(item.queuedAt).toISOString(),
      mine: true,
    }))
    .filter((entry) => !published.has(fingerprint(entry)));

  return [...entries, ...provisional].sort(compareEntries);
}

/** Marca la posición de cada entrada tras ordenar. */
export function withRanks(
  entries: readonly ScoreEntry[]
): readonly (ScoreEntry & { rank: number })[] {
  return entries.map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function fingerprint(entry: ScoreEntry): string {
  return `${entry.challenge}|${entry.nickname}|${entry.elapsedMs}|${entry.fails}`;
}
