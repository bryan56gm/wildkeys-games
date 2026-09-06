import styles from './PhotoSlot.module.css';
import { cx } from '@wkg/ui';
import type { PhotoRef } from '../types';

export interface PhotoSlotProps {
  photo: PhotoRef;
  /** Descripción de la foto; también es el texto del marcador si no hay imagen. */
  label: string;
  /** Alto del hueco: número en píxeles o cualquier medida CSS. */
  height: number | string;
  className?: string;
}

/**
 * Foto de un objetivo. Mientras no exista la imagen real, dibuja un marcador
 * con su descripción: nunca un hueco roto ni un salto de maquetación.
 */
export function PhotoSlot({ photo, label, height, className }: PhotoSlotProps) {
  if (!photo.src) {
    return (
      <div
        className={cx(styles.placeholder, className)}
        style={{ height }}
        role="img"
        aria-label={label}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <circle cx="8.5" cy="9" r="1.6" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        <span className={styles.placeholderLabel}>{label}</span>
      </div>
    );
  }

  return (
    <img
      src={photo.src}
      alt={label}
      className={cx(styles.image, className)}
      style={{ height }}
      loading="eager"
      decoding="async"
    />
  );
}
