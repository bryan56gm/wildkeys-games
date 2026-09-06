import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import styles from './Dialog.module.css';
import { cx } from '../lib/cx.js';
import { useKeyboardInset } from '../lib/use-keyboard-inset.js';

export type DialogPlacement = 'center' | 'sheet' | 'full';

/** Animación de entrada de cada disposición. Las clases viven en el CSS global
 *  junto a sus keyframes: un CSS Module renombraría la referencia y la
 *  animación no llegaría a existir. */
const ENTRANCE: Record<DialogPlacement, string> = {
  center: 'wk-anim-pop-fast',
  sheet: 'wk-anim-rise-fast',
  full: 'wk-anim-pop-quick',
};

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
  const keyboardInset = useKeyboardInset();

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
      // El teclado de iOS tapa lo que hay debajo en vez de encogerlo, así que
      // el diálogo se aparta otro tanto por su cuenta.
      style={{ ['--wk-keyboard-inset' as string]: `${keyboardInset}px` }}
      data-keyboard={keyboardInset > 0 ? '' : undefined}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      {/* El foco va al panel, no al primer campo: `showModal()` enfoca por
          especificación el primer elemento enfocable, y en móvil eso abre el
          teclado encima del texto antes de que dé tiempo a leerlo. Con
          `tabIndex={-1}` el panel es un destino de foco válido sin entrar en
          el recorrido del tabulador, y el lector de pantalla lee el diálogo
          desde el principio. */}
      <div className={cx(styles.panel, ENTRANCE[placement])} tabIndex={-1} autoFocus>
        {children}
      </div>
    </dialog>
  );
}
