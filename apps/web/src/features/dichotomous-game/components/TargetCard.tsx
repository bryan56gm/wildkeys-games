import { Card, cx } from '@wkg/ui';
import type { PhotoRef } from '../types';
import { PhotoSlot } from './PhotoSlot';
import styles from './TargetCard.module.css';

export interface TargetCardProps {
  photo: PhotoRef;
  photoLabel: string;
  photoHeight?: number;
  kicker: string;
  name: string;
  caption: string;
  /** Si se pasa, la foto es un botón que abre el zoom. */
  onZoom?: () => void;
  zoomLabel?: string;
  /** Bloque a la derecha del pie (el número de paso, en partida). */
  aside?: { label: string; value: string };
  /**
   * `inline` pone nombre y pie en la misma línea (pantalla de juego);
   * `stacked` los apila y agranda el nombre (portada).
   */
  layout?: 'inline' | 'stacked';
}

/** Tarjeta del objetivo: foto grande y su identificación. */
export function TargetCard({
  photo,
  photoLabel,
  photoHeight = 180,
  kicker,
  name,
  caption,
  onZoom,
  zoomLabel,
  aside,
  layout = 'inline',
}: TargetCardProps) {
  const image = <PhotoSlot photo={photo} label={photoLabel} height={photoHeight} />;

  return (
    <Card tone="brand" flush className={onZoom ? styles.playable : undefined}>
      {onZoom ? (
        <button type="button" className={styles.photoButton} onClick={onZoom}>
          {image}
          <span className={styles.zoomBadge}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.6"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="20" y1="20" x2="16" y2="16" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            {zoomLabel}
          </span>
        </button>
      ) : (
        image
      )}

      <div className={styles.footer}>
        <div className={cx(styles.identity, layout === 'stacked' && styles.stacked)}>
          <span className={styles.kicker}>{kicker}</span>
          {layout === 'stacked' ? (
            <>
              <span className={styles.name}>{name}</span>
              <span className={styles.caption}>{caption}</span>
            </>
          ) : (
            <span className={styles.name}>
              {name} <span className={styles.caption}>{caption}</span>
            </span>
          )}
        </div>
        {aside ? (
          <span className={styles.aside}>
            <span className={styles.asideLabel}>{aside.label}</span>
            <span className={styles.asideValue}>{aside.value}</span>
          </span>
        ) : null}
      </div>
    </Card>
  );
}
