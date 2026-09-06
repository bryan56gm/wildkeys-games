import type { ReactNode } from 'react';
import styles from './VisuallyHidden.module.css';

/** Texto solo para lectores de pantalla. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className={styles.hidden}>{children}</span>;
}
