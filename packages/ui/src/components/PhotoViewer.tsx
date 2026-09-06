import { useEffect, useRef, useState } from 'react';
import { Dialog } from './Dialog.js';
import { IconButton } from './IconButton.js';
import styles from './PhotoViewer.module.css';

/** Cuánto se agranda la foto al ampliarla. */
const ZOOM = 2.5;

export interface PhotoViewerProps {
  open: boolean;
  onClose(): void;
  src: string;
  /** Nombre de lo retratado; encabeza el visor y describe la imagen. */
  name: string;
  caption?: string;
  closeLabel: string;
  /** Pista de uso al pie. */
  hint?: string;
}

/**
 * Visor de una fotografía a pantalla completa.
 *
 * El acercamiento y el desplazamiento los hace **el navegador**: la foto crece
 * dentro de un contenedor con scroll, así que se arrastra con la misma inercia
 * que cualquier página y se puede pellizcar como en la galería del teléfono.
 *
 * Antes esto estaba implementado a mano con eventos de puntero, y al llegar el
 * segundo dedo `setPointerCapture` lanzaba `NotFoundError` y se llevaba por
 * delante la pantalla entera. Reimplementar un gesto que el sistema ya resuelve
 * salía caro y peor: así no hay estado que se pueda romper, y va más suave.
 *
 * Quien lo monte debe darle una `key` por fotografía, para que cada una se abra
 * encajada aunque la anterior quedara ampliada.
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
  const [zoomed, setZoomed] = useState(false);
  const stage = useRef<HTMLDivElement>(null);

  // Al ampliar, el centro de la foto es lo que interesa ver primero.
  useEffect(() => {
    const element = stage.current;
    if (!element || !zoomed) return;
    element.scrollTo({
      left: (element.scrollWidth - element.clientWidth) / 2,
      top: (element.scrollHeight - element.clientHeight) / 2,
    });
  }, [zoomed]);

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

      <div ref={stage} className={styles.stage} data-zoomed={zoomed ? '' : undefined}>
        <img
          src={src}
          alt={name}
          className={styles.image}
          style={zoomed ? { width: `${ZOOM * 100}%` } : undefined}
          draggable={false}
          onClick={() => setZoomed((current) => !current)}
        />
      </div>

      {hint ? <p className={styles.hint}>{hint}</p> : null}
    </Dialog>
  );
}
