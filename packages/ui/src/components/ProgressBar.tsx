import styles from './ProgressBar.module.css';
import { cx } from '../lib/cx.js';

export interface ProgressBarProps {
  /** Avance entre 0 y 1; se recorta al rango si llega fuera. */
  value: number;
  /** Etiqueta accesible ("Progreso de la clave"). */
  label: string;
  className?: string | undefined;
}

/** Barra de avance del recorrido. Expone `role="progressbar"` para lectores. */
export function ProgressBar({ value, label, className }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, value));
  const percent = Math.round(clamped * 100);

  return (
    <div
      className={cx(styles.track, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
    >
      <div className={styles.fill} style={{ width: `${percent}%` }} />
    </div>
  );
}
