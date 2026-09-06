import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './IconButton.module.css';
import { cx } from '../lib/cx.js';

export interface IconButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  /** Obligatoria: el botón no tiene texto visible. */
  label: string;
  tone?: 'onDark' | 'plain';
  children: ReactNode;
  className?: string | undefined;
}

/** Botón circular de solo icono (cerrar el zoom, etc.). */
export function IconButton({
  label,
  tone = 'plain',
  children,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cx(styles.button, styles[tone], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
