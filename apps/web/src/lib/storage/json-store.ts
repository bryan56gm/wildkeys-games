import type { KeyValueStore } from '@wkg/leaderboard';

/** Vista tipada sobre una clave concreta del almacén. */
export interface JsonStore<T> {
  read(): T | null;
  write(value: T): void;
  clear(): void;
}

/**
 * Lee y escribe un valor JSON validándolo al leer. El `guard` es obligatorio a
 * propósito: cualquiera puede editar `localStorage`, y un dato con otra forma
 * (o de una versión anterior del juego) debe descartarse, no romper la app.
 */
export function createJsonStore<T>(
  store: KeyValueStore,
  key: string,
  guard: (value: unknown) => value is T
): JsonStore<T> {
  return {
    read() {
      const raw = store.read(key);
      if (!raw) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        return guard(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },
    write(value) {
      store.write(key, JSON.stringify(value));
    },
    clear() {
      store.remove(key);
    },
  };
}

/** Bandera booleana persistida ("ya vio la bienvenida"). */
export function createFlagStore(store: KeyValueStore, key: string) {
  return {
    isSet: () => store.read(key) === '1',
    set: () => store.write(key, '1'),
    clear: () => store.remove(key),
  };
}
