/** Reto dentro de un juego (en LO VILOT: lúpulo o carnívoros). */
export type ChallengeId = string;

/** Marca tal y como la envía el cliente. */
export interface ScoreDraft {
  readonly gameSlug: string;
  readonly challenge: ChallengeId;
  readonly nickname: string;
  readonly elapsedMs: number;
  readonly fails: number;
}

/** Marca ya publicada en la clasificación. */
export interface ScoreEntry extends ScoreDraft {
  readonly id: string;
  readonly createdAt: string;
  /** `true` si la envió este dispositivo. */
  readonly mine: boolean;
}

/** Marca aún no sincronizada, a la espera de conexión. */
export interface PendingScore extends ScoreDraft {
  /** Id local, estable entre reintentos. */
  readonly localId: string;
  readonly queuedAt: number;
  readonly attempts: number;
}

/** Qué clasificación se pide. */
export interface LeaderboardQuery {
  readonly gameSlug: string;
  readonly challenge: ChallengeId;
  readonly limit?: number;
}

/** Resultado de intentar publicar una marca. */
export type SubmitOutcome =
  | { readonly status: 'published'; readonly entry: ScoreEntry }
  | { readonly status: 'queued'; readonly pending: PendingScore; readonly reason: string }
  | { readonly status: 'rejected'; readonly reason: string };

/** Estado de sincronización que la UI muestra al jugador. */
export type SyncState = 'idle' | 'syncing' | 'offline' | 'disabled';

/** Almacén de cadenas inyectable: la app decide dónde persiste. */
export interface KeyValueStore {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}
