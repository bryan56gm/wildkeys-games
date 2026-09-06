import type { KeyValueStore } from '@wkg/leaderboard';

/**
 * `localStorage` puede lanzar (modo privado, cookies bloqueadas, cuota llena).
 * Estas envolturas nunca lanzan: si el almacén del navegador no está
 * disponible se sigue jugando contra memoria, y solo se pierde la persistencia.
 */
export function createSafeStorage(kind: 'local' | 'session'): KeyValueStore {
  const backing = resolveBackingStore(kind);
  if (!backing) return createMemoryStorage();

  return {
    read(key) {
      try {
        return backing.getItem(key);
      } catch {
        return null;
      }
    },
    write(key, value) {
      try {
        backing.setItem(key, value);
      } catch {
        /* cuota o permisos: el juego sigue, sin persistir */
      }
    },
    remove(key) {
      try {
        backing.removeItem(key);
      } catch {
        /* ídem */
      }
    },
  };
}

/** Almacén volátil de reserva; también sirve en tests. */
export function createMemoryStorage(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    read: (key) => data.get(key) ?? null,
    write: (key, value) => void data.set(key, value),
    remove: (key) => void data.delete(key),
  };
}

/** Prefija todas las claves, para aislar juegos entre sí. */
export function namespaced(store: KeyValueStore, prefix: string): KeyValueStore {
  const withPrefix = (key: string) => `${prefix}.${key}`;
  return {
    read: (key) => store.read(withPrefix(key)),
    write: (key, value) => store.write(withPrefix(key), value),
    remove: (key) => store.remove(withPrefix(key)),
  };
}

function resolveBackingStore(kind: 'local' | 'session'): Storage | null {
  try {
    const storage = kind === 'local' ? window.localStorage : window.sessionStorage;
    const probe = '__wk_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}
