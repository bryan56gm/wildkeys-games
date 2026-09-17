import { useState } from 'react';
import { cx } from '@wkg/ui';
import styles from './PhotoSlot.module.css';
import type { PhotoRef } from '../types';

/**
 * Hasta dónde se deja estirar el marco para acomodar la foto.
 *
 * Las fotos llegan con proporciones muy distintas: unas casi panorámicas
 * (900×491) y otras verticales (600×900). Con un marco fijo, o se recorta media
 * imagen o queda diminuta entre franjas. El marco se adapta a cada una, pero
 * dentro de estos topes: más apaisado sería una tira ilegible y más vertical se
 * comería la pantalla del móvil.
 */
const RATIO_MIN = 0.9;
const RATIO_MAX = 2;

export interface PhotoSlotProps {
  photo: PhotoRef;
  /** Descripción de la foto; también es el texto del marcador si no hay imagen. */
  label: string;
  /** Alto máximo. El marco puede quedar más bajo si la foto es apaisada. */
  maxHeight: number | string;
  /**
   * `adaptive` deja que el marco se ajuste a la proporción de la foto, que es
   * lo que mejor se ve cuando la tarjeta va sola. `fixed` obliga al alto
   * exacto: en un carrusel, dos fotos de distinta proporción descuadran las
   * tarjetas, y ahí importa más que cuadren que ver cada foto entera.
   */
  fit?: 'adaptive' | 'fixed';
  className?: string;
}

/**
 * Foto de un objetivo. Mientras no exista la imagen real, dibuja un marcador
 * con su descripción: nunca un hueco roto ni un salto de maquetación.
 */
export function PhotoSlot({
  photo,
  label,
  maxHeight,
  fit = 'adaptive',
  className,
}: PhotoSlotProps) {
  const [ratio, setRatio] = useState<number | null>(null);

  if (!photo.src) {
    return (
      <div
        className={cx(styles.placeholder, className)}
        style={{ height: maxHeight }}
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
      style={
        fit === 'fixed'
          ? { height: maxHeight }
          : {
              maxHeight,
              // Hasta que se conoce la proporción real se reserva el alto
              // máximo, y así la maqueta no da un salto cuando la imagen entra.
              aspectRatio:
                ratio === null ? undefined : Math.min(RATIO_MAX, Math.max(RATIO_MIN, ratio)),
              height: ratio === null ? maxHeight : undefined,
            }
      }
      onLoad={(event) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (naturalHeight > 0) setRatio(naturalWidth / naturalHeight);
      }}
      loading="eager"
      decoding="async"
    />
  );
}
