/** Primera espera tras un fallo, en milisegundos. */
const BASE_DELAY_MS = 8_000;

/** Techo de la espera: en un evento, más de un minuto es demasiado. */
const MAX_DELAY_MS = 60_000;

/**
 * Cuánto esperar antes de reintentar una marca que no salió.
 *
 * La espera se duplica con cada intento fallido y se detiene en un minuto: lo
 * justo para no machacar un servidor que está arrancando, y lo bastante corto
 * para que una marca llegue mientras su dueño sigue en la sala.
 */
export function nextRetryDelay(attempts: number): number {
  const exponent = Math.max(0, attempts);
  return Math.min(BASE_DELAY_MS * 2 ** exponent, MAX_DELAY_MS);
}
