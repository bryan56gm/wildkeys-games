import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Kicker.module.css';
import { cx } from '../lib/cx.js';

export type KickerTone = 'brand' | 'accent' | 'muted' | 'danger' | 'onDark';

export interface KickerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  tone?: KickerTone;
  children: ReactNode;
  className?: string | undefined;
}

/** Antetítulo en versalitas: el rótulo que encabeza casi todos los bloques. */
export function Kicker({ tone = 'muted', children, className, ...rest }: KickerProps) {
  return (
    <span className={cx(styles.kicker, styles[tone], className)} {...rest}>
      {children}
    </span>
  );
}
