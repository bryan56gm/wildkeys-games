import { formatClock } from '@/lib/format/time';
import { useElapsed } from '../hooks/use-elapsed';
import styles from './LiveClock.module.css';

export interface LiveClockProps {
  /** Instante de arranque; `null` congela el reloj en `frozenMs`. */
  startedAt: number | null;
  frozenMs?: number;
}

/**
 * Cronómetro de la cabecera. Aísla el tic en este componente: el resto de la
 * pantalla no se repinta cuatro veces por segundo.
 */
export function LiveClock({ startedAt, frozenMs = 0 }: LiveClockProps) {
  const elapsed = useElapsed(startedAt, frozenMs);

  return (
    <span className={styles.clock}>
      <span className={styles.ping} aria-hidden="true">
        <span className={styles.pingHalo} />
        <span className={styles.pingDot} />
      </span>
      <time className={styles.value}>{formatClock(elapsed)}</time>
    </span>
  );
}
