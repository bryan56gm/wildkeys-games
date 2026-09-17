import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './PlainButton.module.css';
import { cx } from '../lib/cx.js';

export interface PlainButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className'
> {
  /** Obligatoria cuando el contenido no es texto legible (una marca, un logo). */
  label?: string;
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Hace pulsable algo que ya trae su propio aspecto —la marca de la cabecera—
 * sin imponerle ninguno.
 *
 * Existe para que nadie tenga que volver a desandar a mano los estilos que el
 * navegador le pone a un `<button>` (borde, fondo, fuente, alineación), que es
 * justo el parche que este kit está para evitar. Lo único que sí aporta es lo
 * que no se debe perder: foco visible y respuesta al toque.
 */
export function PlainButton({ label, children, className, ...rest }: PlainButtonProps) {
  return (
    <button type="button" aria-label={label} className={cx(styles.button, className)} {...rest}>
      {children}
    </button>
  );
}
