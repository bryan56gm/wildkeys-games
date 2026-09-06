import type { KeyValueStore, LeaderboardQuery, ScoreEntry } from './types.js';

const SNAPSHOT_PREFIX = 'wkg.board-snapshot';

/** Clasificación cacheada de la última vez que hubo red. */
export interface BoardSnapshot {
  readonly entries: readonly ScoreEntry[];
  /** Momento de la última sincronización correcta. */
  readonly fetchedAt: number;
}

/**
 * Guarda la última clasificación conocida por reto. Sin conexión el Board
 * pinta esto con un aviso, en vez de quedarse en blanco o dar error.
 */
export interface SnapshotStore {
  read(query: LeaderboardQuery): BoardSnapshot | null;
  write(query: LeaderboardQuery, entries: readonly ScoreEntry[]): void;
}

export function createSnapshotStore(
  store: KeyValueStore,
  now: () => number = Date.now
): SnapshotStore {
  return {
    read(query) {
      const raw = store.read(snapshotKey(query));
      if (!raw) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return null;
        const candidate = parsed as { entries?: unknown; fetchedAt?: unknown };
        if (!Array.isArray(candidate.entries) || typeof candidate.fetchedAt !== 'number')
          return null;
        return { entries: candidate.entries as ScoreEntry[], fetchedAt: candidate.fetchedAt };
      } catch {
        return null;
      }
    },

    write(query, entries) {
      const snapshot: BoardSnapshot = { entries, fetchedAt: now() };
      store.write(snapshotKey(query), JSON.stringify(snapshot));
    },
  };
}

function snapshotKey(query: LeaderboardQuery): string {
  return `${SNAPSHOT_PREFIX}:${query.gameSlug}:${query.challenge}`;
}
