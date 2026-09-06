import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import styles from './Button.module.css';
import { cx } from '../lib/cx.js';

export type ButtonVariant = 'primary' | 'outline' | 'neutral' | 'inverse' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ocupa todo el ancho disponible; por defecto sí, el diseño es de una columna. */
  block?: boolean;
  /** Icono a la derecha del texto (la chevron del prototipo). */
  trailing?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  className?: string | undefined;
}

/**
 * Botón del sistema. `type="button"` por defecto: en esta app ningún botón
 * envía formularios salvo que se pida explícitamente.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  block = true,
  trailing,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], block && styles.block, className)}
      {...rest}
    >
      <span className={styles.label}>{children}</span>
      {trailing ? <span className={styles.trailing}>{trailing}</span> : null}
    </button>
  );
}
