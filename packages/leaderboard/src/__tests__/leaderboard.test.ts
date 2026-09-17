import { beforeEach, describe, expect, it } from 'vitest';
import { validateScore } from '../config.js';
import { createScoreQueue } from '../queue.js';
import { compareEntries, mergeWithPending } from '../ranking.js';
import { nextRetryDelay } from '../retry.js';
import { createSnapshotStore } from '../snapshot.js';
import type { KeyValueStore, ScoreEntry } from '../types.js';

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    read: (key) => data.get(key) ?? null,
    write: (key, value) => void data.set(key, value),
    remove: (key) => void data.delete(key),
  };
}

const entry = (patch: Partial<ScoreEntry>): ScoreEntry => ({
  id: 'x',
  gameSlug: 'lovilot',
  challenge: 'hop',
  nickname: 'Nom',
  elapsedMs: 40_000,
  fails: 0,
  createdAt: '2026-09-01T10:00:00.000Z',
  mine: false,
  ...patch,
});

describe('validateScore', () => {
  const valid = { nickname: 'Equip Linx', elapsedMs: 42_000, fails: 1 };

  it('acepta una marca realista', () => {
    expect(validateScore(valid)).toBeNull();
  });

  it('rechaza nombres fuera de rango', () => {
    expect(validateScore({ ...valid, nickname: 'a' })).toBe('nickname-too-short');
    expect(validateScore({ ...valid, nickname: 'x'.repeat(15) })).toBe('nickname-too-long');
  });

  it('rechaza tiempos imposibles', () => {
    expect(validateScore({ ...valid, elapsedMs: 900 })).toBe('elapsed-too-short');
    expect(validateScore({ ...valid, elapsedMs: 9_999_999 })).toBe('elapsed-too-long');
  });

  it('rechaza fallos inválidos', () => {
    expect(validateScore({ ...valid, fails: -1 })).toBe('fails-invalid');
    expect(validateScore({ ...valid, fails: 1.5 })).toBe('fails-invalid');
  });
});

describe('cola offline', () => {
  let store: KeyValueStore;
  beforeEach(() => {
    store = memoryStore();
  });

  it('encola, cuenta intentos y elimina', () => {
    const queue = createScoreQueue(store);
    const pending = queue.enqueue({
      gameSlug: 'lovilot',
      challenge: 'hop',
      nickname: 'A',
      elapsedMs: 30_000,
      fails: 0,
    });

    expect(queue.list()).toHaveLength(1);
    queue.markAttempt(pending.localId);
    expect(queue.list()[0]?.attempts).toBe(1);
    queue.remove(pending.localId);
    expect(queue.list()).toEqual([]);
  });

  it('ignora contenido corrupto en el almacén', () => {
    store.write('wkg.score-queue', '{no es json');
    expect(createScoreQueue(store).list()).toEqual([]);
  });

  it('descarta entradas con forma inesperada', () => {
    store.write('wkg.score-queue', JSON.stringify([{ localId: 'a' }, null, 3]));
    expect(createScoreQueue(store).list()).toEqual([]);
  });
});

describe('snapshot', () => {
  it('guarda y recupera la última clasificación', () => {
    const store = memoryStore();
    const snapshots = createSnapshotStore(store, () => 1_000);
    const query = { gameSlug: 'lovilot', challenge: 'hop' };

    snapshots.write(query, [entry({ id: '1' })]);
    expect(snapshots.read(query)).toEqual({ entries: [entry({ id: '1' })], fetchedAt: 1_000 });
    expect(snapshots.read({ gameSlug: 'lovilot', challenge: 'carn' })).toBeNull();
  });
});

describe('ranking', () => {
  it('ordena por tiempo, luego fallos, luego antigüedad', () => {
    const rows = [
      entry({ id: 'c', elapsedMs: 50_000 }),
      entry({ id: 'a', elapsedMs: 40_000, fails: 0 }),
      entry({ id: 'b', elapsedMs: 40_000, fails: 2 }),
    ];
    expect([...rows].sort(compareEntries).map((row) => row.id)).toEqual(['a', 'b', 'c']);
  });

  it('añade las pendientes propias sin duplicar las ya publicadas', () => {
    const published = [entry({ id: 'remote', nickname: 'Ana', elapsedMs: 30_000, fails: 0 })];
    const pending = [
      {
        localId: 'p1',
        gameSlug: 'lovilot',
        challenge: 'hop',
        nickname: 'Ana',
        elapsedMs: 30_000,
        fails: 0,
        queuedAt: 0,
        attempts: 0,
      },
      {
        localId: 'p2',
        gameSlug: 'lovilot',
        challenge: 'hop',
        nickname: 'Pau',
        elapsedMs: 25_000,
        fails: 1,
        queuedAt: 0,
        attempts: 0,
      },
    ];

    const merged = mergeWithPending(published, pending);
    expect(merged.map((row) => row.id)).toEqual(['p2', 'remote']);
    expect(merged[0]?.mine).toBe(true);
  });
});

describe('nextRetryDelay', () => {
  it('empieza en ocho segundos y dobla con cada fallo', () => {
    expect(nextRetryDelay(0)).toBe(8_000);
    expect(nextRetryDelay(1)).toBe(16_000);
    expect(nextRetryDelay(2)).toBe(32_000);
  });

  it('no pasa de un minuto: una marca tiene que llegar mientras su dueño sigue en la sala', () => {
    expect(nextRetryDelay(10)).toBe(60_000);
    expect(nextRetryDelay(100)).toBe(60_000);
  });

  it('trata un contador corrupto como el primer intento', () => {
    expect(nextRetryDelay(-5)).toBe(8_000);
  });
});
