import { useCallback, useEffect, useState } from 'react';
import { nextRetryDelay } from '../retry.js';
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
 * Vigila la cola de marcas sin publicar y la vacía cuando puede.
 *
 * Reintentar solo al recuperar la conexión no basta: el caso más común no es
 * que el móvil se quede sin red, sino que el servidor no esté —caído, pausado,
 * o a medio despertar—. Ahí el navegador nunca pierde conexión, el evento
 * `online` no llega nunca, y la marca se queda encallada hasta que alguien
 * recarga la página. Así que mientras quede cola se reintenta por su cuenta,
 * espaciando los intentos, y también al volver a la aplicación.
 *
 * Se monta una sola vez, alto en el árbol: es un efecto de fondo, no una
 * pantalla.
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
    // Volver a la aplicación es el momento más probable de volver a tener red.
    const onVisible = () => {
      if (document.visibilityState === 'visible') sync();
    };

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    document.addEventListener('visibilitychange', onVisible);

    // Vaciado inicial por si quedó cola de una sesión anterior. Se difiere para
    // no encadenar renders durante el montaje.
    const initial = navigator.onLine ? window.setTimeout(sync, 0) : null;

    return () => {
      if (initial !== null) window.clearTimeout(initial);
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [sync]);

  /*
   * Reintento espaciado mientras quede algo en la cola. `attempts` lo lleva la
   * propia marca, así que la espera crece sola con cada fracaso y no hace falta
   * guardar nada aquí; cuando la cola se vacía, este efecto deja de programar
   * nada y el reloj se apaga solo.
   */
  useEffect(() => {
    if (!online || syncing || pending.length === 0) return;

    const attempts = Math.min(...pending.map((score) => score.attempts));
    const timer = window.setTimeout(sync, nextRetryDelay(attempts));
    return () => window.clearTimeout(timer);
  }, [online, pending, syncing, sync]);

  return { pending, syncing, online, sync };
}
