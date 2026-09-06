import { useCallback, useMemo, useState } from 'react';
import { createFlagStore } from '@/lib/storage/json-store';
import { createSafeStorage, namespaced } from '@/lib/storage/safe-storage';

/** Marca que se recuerda para siempre en este dispositivo. */
export interface OnceFlag {
  readonly done: boolean;
  markDone(): void;
}

/**
 * Bandera persistente de "esto ya se ha visto".
 *
 * `local` para lo que no debe repetirse nunca (la bienvenida) y `session`
 * para lo que basta con no repetir dentro de la misma visita (la pantalla de
 * carga), igual que en el prototipo.
 */
export function useOnceFlag(gameSlug: string, name: string, scope: 'local' | 'session'): OnceFlag {
  const store = useMemo(
    () => createFlagStore(namespaced(createSafeStorage(scope), `wk.${gameSlug}`), name),
    [gameSlug, name, scope]
  );

  const [done, setDone] = useState(() => store.isSet());

  const markDone = useCallback(() => {
    store.set();
    setDone(true);
  }, [store]);

  return { done, markDone };
}
