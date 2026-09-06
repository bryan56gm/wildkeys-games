import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';
import { cx } from '../lib/cx.js';

export type CardTone = 'plain' | 'brand' | 'accent' | 'danger' | 'dark';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  tone?: CardTone;
  /** Sin relleno interior: para tarjetas que empiezan con una foto a sangre. */
  flush?: boolean;
  children: ReactNode;
  className?: string | undefined;
}

/** Superficie base del diseño. El tono define borde, fondo y color de texto. */
export function Card({ tone = 'plain', flush = false, children, className, ...rest }: CardProps) {
  return (
    <div
      className={cx(styles.card, styles[tone], flush ? styles.flush : styles.padded, className)}
      {...rest}
    >
      {children}
    </div>
  );
}
