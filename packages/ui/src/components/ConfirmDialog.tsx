import { Button } from './Button.js';
import { Dialog } from './Dialog.js';
import styles from './ConfirmDialog.module.css';
import { cx } from '../lib/cx.js';

export interface ConfirmDialogCopy {
  title: string;
  body: string;
  /** Acción que sigue adelante; es la secundaria, no la destacada. */
  confirm: string;
  /** Acción que vuelve atrás; es la que el diseño empuja. */
  cancel: string;
}

export interface ConfirmDialogProps {
  open: boolean;
  onConfirm(): void;
  onCancel(): void;
  copy: ConfirmDialogCopy;
  /** `warning` tiñe el icono y el título de aviso. */
  tone?: 'plain' | 'warning';
  className?: string | undefined;
}

/**
 * Pregunta de sí o no antes de algo que no se deshace.
 *
 * Es del kit y no de cada pantalla a propósito: todas las confirmaciones de la
 * plataforma deben verse y comportarse igual —mismo tamaño de tarjeta, mismo
 * orden de botones, misma tecla de escape— y hacerlo con una copia del CSS en
 * cada sitio es exactamente como se desparejan.
 *
 * El orden de los botones no es decorativo: continuar hacia atrás es lo que el
 * usuario quiere casi siempre, así que es el botón primario y va a la derecha,
 * bajo el pulgar. Confirmar queda en tono neutro, sin prisa.
 */
export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  copy,
  tone = 'plain',
  className,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      label={copy.title}
      placement="center"
      className={className}
    >
      <span className={cx(styles.badge, styles[tone])} aria-hidden="true">
        <WarningIcon />
      </span>
      <div className={styles.text}>
        <h2 className={styles.title}>{copy.title}</h2>
        <p className={styles.body}>{copy.body}</p>
      </div>
      <div className={styles.actions}>
        <Button variant="neutral" onClick={onConfirm}>
          {copy.confirm}
        </Button>
        <Button onClick={onCancel}>{copy.cancel}</Button>
      </div>
    </Dialog>
  );
}

function WarningIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}
