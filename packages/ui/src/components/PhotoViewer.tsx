import { useEffect } from 'react';
import { Dialog } from './Dialog.js';
import { IconButton } from './IconButton.js';
import { usePinchZoom } from '../lib/use-pinch-zoom.js';
import styles from './PhotoViewer.module.css';

/** Cuánto acercan o alejan los botones y el teclado de una vez. */
const STEP = 1.6;

export interface PhotoViewerProps {
  open: boolean;
  onClose(): void;
  src: string;
  /** Nombre de lo retratado; encabeza el visor y describe la imagen. */
  name: string;
  caption?: string;
  closeLabel: string;
  zoomInLabel: string;
  zoomOutLabel: string;
  /** Pista de uso al pie. */
  hint?: string;
}

/**
 * Visor de una fotografía a pantalla completa, con pellizco y arrastre.
 *
 * El gesto lo resuelve el visor (ver `usePinchZoom`) en lugar de dejárselo al
 * navegador: el pellizco nativo agranda la página entera, no la foto, y dentro
 * de un diálogo a pantalla completa eso lo descoloca todo.
 *
 * Lo que se puede hacer con el dedo se puede hacer también sin él: los botones
 * de acercar y alejar, `+` y `-` en el teclado, y `0` o Escape para volver a
 * encajarla. Un gesto que solo existe como gesto deja fuera a quien no puede
 * hacerlo.
 */
export function PhotoViewer({
  open,
  onClose,
  src,
  name,
  caption,
  closeLabel,
  zoomInLabel,
  zoomOutLabel,
  hint,
}: PhotoViewerProps) {
  const { attachFrame, attachContent, zoomed, zoomBy, reset } = usePinchZoom();

  // Cada foto se abre encajada, aunque la anterior quedara ampliada.
  useEffect(() => {
    reset();
  }, [reset, src, open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === '+' || event.key === '=') zoomBy(STEP);
      else if (event.key === '-') zoomBy(1 / STEP);
      else if (event.key === '0') reset();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, reset, zoomBy]);

  return (
    <Dialog open={open} onClose={onClose} label={name} placement="full" className={styles.viewer}>
      <header className={styles.head}>
        <div className={styles.names}>
          <span className={styles.name}>{name}</span>
          {caption ? <span className={styles.caption}>{caption}</span> : null}
        </div>

        <div className={styles.tools}>
          <IconButton
            label={zoomOutLabel}
            tone="onDark"
            onClick={() => zoomBy(1 / STEP)}
            disabled={!zoomed}
          >
            <MinusIcon />
          </IconButton>
          <IconButton label={zoomInLabel} tone="onDark" onClick={() => zoomBy(STEP)}>
            <PlusIcon />
          </IconButton>
          <IconButton label={closeLabel} tone="onDark" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </header>

      <div ref={attachFrame} className={styles.stage} data-zoomed={zoomed ? '' : undefined}>
        {/* La transformación la escribe el gesto directamente en el elemento,
            fotograma a fotograma: no viene de aquí. */}
        <img ref={attachContent} src={src} alt={name} className={styles.image} draggable={false} />
      </div>

      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </Dialog>
  );
}

function PlusIcon() {
  return (
    <ToolIcon>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </ToolIcon>
  );
}

function MinusIcon() {
  return (
    <ToolIcon>
      <line x1="5" y1="12" x2="19" y2="12" />
    </ToolIcon>
  );
}

function CloseIcon() {
  return (
    <ToolIcon>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </ToolIcon>
  );
}

function ToolIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
