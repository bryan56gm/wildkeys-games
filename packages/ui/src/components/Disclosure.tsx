import type { ReactNode } from 'react';
import styles from './Disclosure.module.css';
import { cx } from '../lib/cx.js';

export interface DisclosureProps {
  /** Lo que se lee cerrado. Debe decir qué hay dentro, no «ver más». */
  summary: string;
  /** Dato corto a la derecha del título: «6 pasos». */
  note?: string | undefined;
  /** Abierto de entrada. Por defecto cerrado: es detalle, no lo primero. */
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Sección plegable para el detalle que no todo el mundo quiere ahora.
 *
 * Sobre `<details>` nativo: el navegador ya trae el estado, el teclado, el
 * anuncio al lector de pantalla y la búsqueda dentro de la página. Lo único que
 * se añade es el aspecto.
 */
export function Disclosure({
  summary,
  note,
  defaultOpen = false,
  children,
  className,
}: DisclosureProps) {
  return (
    <details className={cx(styles.details, className)} open={defaultOpen}>
      <summary className={styles.summary}>
        <span className={styles.title}>{summary}</span>
        {note ? <span className={styles.note}>{note}</span> : null}
        <span className={styles.chevron} aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </summary>
      <div className={styles.content}>{children}</div>
    </details>
  );
}
