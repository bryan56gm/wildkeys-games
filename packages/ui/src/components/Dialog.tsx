import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import styles from './Dialog.module.css';
import { cx } from '../lib/cx.js';

export type DialogPlacement = 'center' | 'sheet' | 'full';

export interface DialogProps {
  open: boolean;
  onClose(): void;
  /** Etiqueta accesible del diálogo. */
  label: string;
  placement?: DialogPlacement;
  /**
   * Si es `false`, ni Escape ni el clic fuera cierran: el usuario tiene que
   * usar el botón. Se usa en la bienvenida, que debe leerse una vez.
   */
  dismissible?: boolean;
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Diálogo modal sobre el `<dialog>` nativo: bloqueo de foco, capa superior y
 * cierre con Escape los pone el navegador. Sin librerías ni portales.
 */
export function Dialog({
  open,
  onClose,
  label,
  placement = 'center',
  dismissible = true,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  if (!open) return null;

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault(); // el cierre lo decide React, no el navegador
    if (dismissible) onClose();
  };

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDialogElement>) => {
    if (dismissible && event.target === ref.current) onClose();
  };

  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={cx(styles.dialog, styles[placement], className)}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      <div className={styles.panel}>{children}</div>
    </dialog>
  );
}
