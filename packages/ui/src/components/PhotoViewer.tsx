import { Dialog } from './Dialog.js';
import { IconButton } from './IconButton.js';
import { usePinchZoom } from '../lib/use-pinch-zoom.js';
import styles from './PhotoViewer.module.css';

export interface PhotoViewerProps {
  open: boolean;
  onClose(): void;
  src: string;
  /** Nombre de lo retratado; encabeza el visor y describe la imagen. */
  name: string;
  caption?: string;
  closeLabel: string;
  /** Pista de uso al pie ("toca dos veces para acercar"). */
  hint?: string;
}

/**
 * Visor de una fotografía a pantalla completa.
 *
 * La imagen entra encajada entera —nada de recortes al abrir— y desde ahí se
 * puede acercar con dos dedos o tocando dos veces, y desplazar arrastrando. El
 * desplazamiento está acotado, así que la foto nunca se pierde fuera de la
 * pantalla.
 */
export function PhotoViewer({
  open,
  onClose,
  src,
  name,
  caption,
  closeLabel,
  hint,
}: PhotoViewerProps) {
  const zoom = usePinchZoom();

  return (
    <Dialog open={open} onClose={onClose} label={name} placement="full" className={styles.viewer}>
      <header className={styles.head}>
        <div className={styles.names}>
          <span className={styles.name}>{name}</span>
          {caption ? <span className={styles.caption}>{caption}</span> : null}
        </div>
        <IconButton label={closeLabel} tone="onDark" onClick={onClose}>
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
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </IconButton>
      </header>

      <div
        className={styles.stage}
        data-zoomed={zoom.zoomed ? '' : undefined}
        {...zoom.handlers}
        onDoubleClick={zoom.toggle}
      >
        <img
          src={src}
          alt={name}
          className={styles.image}
          draggable={false}
          style={{
            transform: `scale(${zoom.state.scale}) translate(${zoom.state.x}px, ${zoom.state.y}px)`,
          }}
        />
      </div>

      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </Dialog>
  );
}
