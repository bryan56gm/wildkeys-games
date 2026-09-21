import type { LeaderboardClient } from './client.js';
import { validateScore, type LeaderboardConfig } from './config.js';
import type { ScoreRow } from './database.types.js';
import { createScoreQueue, type ScoreQueue } from './queue.js';
import { compareEntries } from './ranking.js';
import { createSnapshotStore, type BoardSnapshot, type SnapshotStore } from './snapshot.js';
import type {
  KeyValueStore,
  LeaderboardQuery,
  PendingScore,
  ScoreDraft,
  ScoreEntry,
  SubmitOutcome,
} from './types.js';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Corte del evento LO VILOT (sábado 2026-09-19, desde medianoche UTC). Solo muestra marcas
 * posteriores a este instante: las pruebas previas siguen en la base, pero no
 * compiten con las del evento. Para volver a verlo todo, basta con quitar el
 * filtro de `fetchTop` — no se ha borrado ningún dato.
 */
const EVENT_START_ISO = '2026-09-19T00:00:00Z';

/**
 * Fachada única del leaderboard. La UI no habla nunca con Supabase: pide aquí,
 * y este servicio decide si va a red, si encola o si sirve el último snapshot.
 */
export interface LeaderboardService {
  /** `false` cuando no hay credenciales: el juego funciona igual, sin ranking. */
  readonly enabled: boolean;
  readonly deviceId: string;
  submit(draft: ScoreDraft): Promise<SubmitOutcome>;
  fetchTop(query: LeaderboardQuery): Promise<readonly ScoreEntry[]>;
  readCached(query: LeaderboardQuery): BoardSnapshot | null;
  pending(): readonly PendingScore[];
  /** Reintenta la cola. Devuelve cuántas marcas se publicaron. */
  flush(): Promise<number>;
  /** Escucha altas de otros dispositivos. Devuelve la función de baja. */
  subscribe(query: LeaderboardQuery, onChange: () => void): () => void;
}

export interface LeaderboardServiceOptions {
  /**
   * Abre la conexión con Supabase la primera vez que se necesita. `null` si el
   * despliegue no tiene credenciales: entonces el juego funciona igual y las
   * marcas se quedan en cola.
   */
  connect: (() => Promise<LeaderboardClient>) | null;
  config?: LeaderboardConfig | undefined;
  store: KeyValueStore;
  deviceId: string;
}

export function createLeaderboardService(options: LeaderboardServiceOptions): LeaderboardService {
  const { connect, deviceId } = options;
  const pageSize = options.config?.pageSize ?? DEFAULT_PAGE_SIZE;
  const queue = createScoreQueue(options.store);
  const snapshots = createSnapshotStore(options.store);

  // Una sola conexión por sesión, compartida por todas las llamadas.
  let clientPromise: Promise<LeaderboardClient> | null = null;
  const getClient = (): Promise<LeaderboardClient> | null => {
    if (!connect) return null;
    clientPromise ??= connect();
    return clientPromise;
  };

  return {
    enabled: connect !== null,
    deviceId,

    async submit(draft) {
      const invalid = validateScore(draft);
      if (invalid) return { status: 'rejected', reason: invalid };

      const pending = getClient();
      if (!pending) {
        return { status: 'queued', pending: queue.enqueue(draft), reason: 'leaderboard-disabled' };
      }

      try {
        return { status: 'published', entry: await insert(await pending, draft, deviceId) };
      } catch (error) {
        // Este dispositivo ya tiene marca en este reto: no es un fallo de red,
        // y reintentarlo no cambiaría nada.
        if (isAlreadyPublished(error)) return { status: 'rejected', reason: 'already-published' };
        return { status: 'queued', pending: queue.enqueue(draft), reason: describeError(error) };
      }
    },

    async fetchTop(query) {
      const pending = getClient();
      if (!pending) return [];
      const client = await pending;

      const { data, error } = await client
        .from('scores')
        .select('*')
        .eq('game_slug', query.gameSlug)
        .eq('challenge', query.challenge)
        .gte('created_at', EVENT_START_ISO)
        .order('elapsed_ms', { ascending: true })
        .order('fails', { ascending: true })
        .limit(query.limit ?? pageSize);

      if (error) throw new Error(error.message);

      const entries = (data ?? []).map((row) => toEntry(row, deviceId)).sort(compareEntries);
      snapshots.write(query, entries);
      return entries;
    },

    readCached: (query) => snapshots.read(query),
    pending: () => queue.list(),
    flush: () => flushQueue(getClient(), queue, deviceId),

    subscribe(query, onChange) {
      const pending = getClient();
      if (!pending) return () => undefined;

      let cancelled = false;
      let dispose: (() => void) | null = null;

      void pending.then((client) => {
        if (cancelled) return;

        // Realtime admite un solo filtro por suscripción: se filtra por juego
        // en el servidor y el reto se acota al recargar la clasificación.
        const channel = client
          .channel(`scores:${query.gameSlug}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'scores',
              filter: `game_slug=eq.${query.gameSlug}`,
            },
            onChange
          )
          .subscribe();

        dispose = () => void client.removeChannel(channel);
      });

      return () => {
        cancelled = true;
        dispose?.();
      };
    },
  };
}

/** Código de PostgreSQL para violación de unicidad. */
const UNIQUE_VIOLATION = '23505';

/** Error de la clasificación conservando el código de PostgreSQL. */
class LeaderboardError extends Error {
  readonly code: string | undefined;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'LeaderboardError';
    this.code = code;
  }
}

/** La marca ya estaba publicada: el índice único la rechaza por duplicada. */
function isAlreadyPublished(error: unknown): boolean {
  return error instanceof LeaderboardError && error.code === UNIQUE_VIOLATION;
}

async function insert(
  client: LeaderboardClient,
  draft: ScoreDraft,
  deviceId: string
): Promise<ScoreEntry> {
  const { data, error } = await client
    .from('scores')
    .insert({
      game_slug: draft.gameSlug,
      challenge: draft.challenge,
      nickname: draft.nickname.trim(),
      elapsed_ms: Math.round(draft.elapsedMs),
      fails: draft.fails,
      device_id: deviceId,
    })
    .select()
    .single();

  if (error) throw new LeaderboardError(error.message, error.code);
  return toEntry(data, deviceId);
}

/**
 * Reintenta las marcas encoladas en orden. Se detiene al primer fallo de red:
 * si sigue caída, insistir con el resto solo gasta batería. Una marca que el
 * servidor rechaza por duplicada sale de la cola: ya está publicada.
 */
async function flushQueue(
  pending: Promise<LeaderboardClient> | null,
  queue: ScoreQueue,
  deviceId: string
): Promise<number> {
  if (!pending) return 0;
  const client = await pending;

  let published = 0;
  for (const item of queue.list()) {
    try {
      await insert(client, item, deviceId);
      queue.remove(item.localId);
      published += 1;
    } catch (error) {
      if (isAlreadyPublished(error)) {
        queue.remove(item.localId);
        continue;
      }
      queue.markAttempt(item.localId);
      break;
    }
  }
  return published;
}

function toEntry(row: ScoreRow, deviceId: string): ScoreEntry {
  return {
    id: row.id,
    gameSlug: row.game_slug,
    challenge: row.challenge,
    nickname: row.nickname,
    elapsedMs: row.elapsed_ms,
    fails: row.fails,
    createdAt: row.created_at,
    mine: row.device_id === deviceId,
  };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : 'network-error';
}

export type { SnapshotStore, BoardSnapshot };
