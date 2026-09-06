import { useEffect, useState } from 'react';

/** Cadencia del cronómetro: suficiente para que los segundos no se salten. */
const TICK_MS = 250;

/**
 * Milisegundos transcurridos desde `startedAt`, o `frozenMs` cuando la partida
 * ya ha terminado.
 *
 * El tiempo se deriva siempre del reloj del sistema, no de un contador que se
 * incrementa: cerrar y reabrir la app no regala tiempo al jugador, y un tic
 * perdido no descuadra la marca.
 *
 * Se usa dentro del componente del reloj y de ningún otro, para que el tic
 * repinte solo ese nodo y no la pantalla entera.
 */
export function useElapsed(startedAt: number | null, frozenMs = 0): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) return;

    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return startedAt === null ? frozenMs : Math.max(0, now - startedAt);
}
