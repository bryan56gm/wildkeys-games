import {
  useEffect,
  useRef,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import styles from './Dialog.module.css';
import { cx } from '../lib/cx.js';
import { useVisualViewportHeight } from '../lib/use-visual-viewport.js';

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
  const panelRef = useRef<HTMLDivElement>(null);
  const visualHeight = useVisualViewportHeight();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      // `showModal()` reparte el foco por especificación y, sin un elemento con
      // `autofocus` en el DOM, se lo lleva el primer campo enfocable — en móvil
      // eso abre el teclado encima del texto. React no renderiza el atributo
      // (lo aplica por su cuenta, y antes de este efecto), así que el foco al
      // panel se pone aquí, después, que es lo único que el navegador respeta.
      panelRef.current?.focus({ preventScroll: true });
    }
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
      /*
       * El diálogo mide lo que mide el área visible, no la pantalla. Al abrirse
       * el teclado, el hueco encoge y el diálogo con él: el contenido se
       * reacomoda donde toca en vez de quedar tapado, y no hace falta moverlo.
       */
      style={visualHeight === null ? undefined : { height: `${visualHeight}px` }}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
    >
      {/* El foco va al panel, no al primer campo (lo coloca el efecto de
          arriba). Con `tabIndex={-1}` el panel es un destino de foco válido sin
          entrar en el recorrido del tabulador, y el lector de pantalla lee el
          diálogo desde el principio. */}
      <div ref={panelRef} className={cx(styles.panel, ENTRANCE[placement])} tabIndex={-1}>
        {children}
      </div>
    </dialog>
  );
}
