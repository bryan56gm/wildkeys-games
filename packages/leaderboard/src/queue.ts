import { randomId } from './device.js';
import type { KeyValueStore, PendingScore, ScoreDraft } from './types.js';

const QUEUE_KEY = 'wkg.score-queue';
/** Tope defensivo: si algo va mal, la cola no crece sin límite. */
const MAX_QUEUED = 50;

/**
 * Cola de marcas pendientes de publicar. Vive en el almacén que le inyecten
 * (localStorage en la app) y sobrevive a recargas y a cerrar el navegador.
 */
export interface ScoreQueue {
  list(): readonly PendingScore[];
  enqueue(draft: ScoreDraft): PendingScore;
  remove(localId: string): void;
  markAttempt(localId: string): void;
}

export function createScoreQueue(store: KeyValueStore, now: () => number = Date.now): ScoreQueue {
  const read = (): PendingScore[] => parseQueue(store.read(QUEUE_KEY));
  const write = (items: readonly PendingScore[]): void => {
    store.write(QUEUE_KEY, JSON.stringify(items.slice(-MAX_QUEUED)));
  };

  return {
    list: read,

    enqueue(draft) {
      const pending: PendingScore = { ...draft, localId: randomId(), queuedAt: now(), attempts: 0 };
      write([...read(), pending]);
      return pending;
    },

    remove(localId) {
      write(read().filter((item) => item.localId !== localId));
    },

    markAttempt(localId) {
      write(
        read().map((item) =>
          item.localId === localId ? { ...item, attempts: item.attempts + 1 } : item
        )
      );
    },
  };
}

/**
 * Lee la cola tolerando datos corruptos: un `localStorage` manipulado o de una
 * versión anterior no debe romper el arranque del juego.
 */
function parseQueue(raw: string | null): PendingScore[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPendingScore) : [];
  } catch {
    return [];
  }
}

function isPendingScore(value: unknown): value is PendingScore {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item['localId'] === 'string' &&
    typeof item['gameSlug'] === 'string' &&
    typeof item['challenge'] === 'string' &&
    typeof item['nickname'] === 'string' &&
    typeof item['elapsedMs'] === 'number' &&
    typeof item['fails'] === 'number' &&
    typeof item['queuedAt'] === 'number' &&
    typeof item['attempts'] === 'number'
  );
}
