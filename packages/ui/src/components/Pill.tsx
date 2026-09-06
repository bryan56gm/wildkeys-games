import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Pill.module.css';
import { cx } from '../lib/cx.js';

export type PillTone = 'brand' | 'neutral' | 'mono';

export interface PillProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  tone?: PillTone;
  children: ReactNode;
  className?: string | undefined;
}

/** Etiqueta redondeada: pasos del recorrido, marcas "tú"/"demo", contadores. */
export function Pill({ tone = 'neutral', children, className, ...rest }: PillProps) {
  return (
    <span className={cx(styles.pill, styles[tone], className)} {...rest}>
      {children}
    </span>
  );
}
