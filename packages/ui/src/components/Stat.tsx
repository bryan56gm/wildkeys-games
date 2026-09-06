import type { ReactNode } from 'react';
import styles from './Stat.module.css';

export interface StatProps {
  label: string;
  value: ReactNode;
}

/** Métrica de la pantalla de victoria: tiempo, pasos, fallos. */
export function Stat({ label, value }: StatProps) {
  return (
    <div className={styles.stat}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  );
}
