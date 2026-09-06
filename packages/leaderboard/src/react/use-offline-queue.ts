import { useCallback, useEffect, useState } from 'react';
import type { PendingScore } from '../types.js';
import { useLeaderboardService } from './context.js';

export interface UseOfflineQueueResult {
  readonly pending: readonly PendingScore[];
  readonly syncing: boolean;
  readonly online: boolean;
  /** Fuerza un reintento (además del automático al recuperar conexión). */
  sync(): void;
}

/**
 * Vigila la cola de marcas sin publicar y la vacía en cuanto vuelve la
 * conexión. Se monta una sola vez, alto en el árbol: es un efecto de fondo,
 * no una pantalla.
 */
export function useOfflineQueue(): UseOfflineQueueResult {
  const service = useLeaderboardService();
  const [pending, setPending] = useState<readonly PendingScore[]>(() => service.pending());
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  );

  const sync = useCallback(() => {
    if (!service.enabled || service.pending().length === 0) {
      setPending(service.pending());
      return;
    }
    setSyncing(true);
    void service
      .flush()
      .catch(() => 0)
      .finally(() => {
        setPending(service.pending());
        setSyncing(false);
      });
  }, [service]);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      sync();
    };
    const goOffline = () => setOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Vaciado inicial por si quedó cola de una sesión anterior. Se difiere para
    // no encadenar renders durante el montaje.
    const initial = navigator.onLine ? window.setTimeout(sync, 0) : null;

    return () => {
      if (initial !== null) window.clearTimeout(initial);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, [sync]);

  return { pending, syncing, online, sync };
}
