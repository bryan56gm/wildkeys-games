import { Children, type ReactNode } from 'react';
import styles from './Carousel.module.css';
import { cx } from '../lib/cx.js';
import { useCarousel } from '../lib/use-carousel.js';

export interface CarouselProps {
  /** Etiqueta del conjunto, para quien navega con lector de pantalla. */
  label: string;
  /** Rótulo de una diapositiva: «Reto 2 de 3». Se ve y se lee. */
  slideLabel(position: number, total: number): string;
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Carrusel horizontal de tarjetas.
 *
 * Que haya más de una tarjeta se dice de dos formas a la vez, porque una sola
 * no basta: la siguiente **asoma** por el borde —la señal que de verdad invita
 * a arrastrar— y un rótulo dice **en palabras** por dónde vas. Los puntos son
 * el último aviso, no el primero: solos se leen como decoración.
 *
 * Con una sola tarjeta no hay carrusel: se devuelve tal cual, sin rótulo ni
 * puntos que anuncien algo que no existe.
 */
export function Carousel({ label, slideLabel, children, className }: CarouselProps) {
  const slides = Children.toArray(children);
  const { trackRef, index, goTo } = useCarousel(slides.length);

  if (slides.length <= 1) return <>{slides}</>;

  return (
    <section className={cx(styles.carousel, className)} aria-roledescription="carrusel">
      {/* Enfocable: sin esto el carrusel no se puede recorrer con el teclado,
            que es la única forma de llegar a la segunda tarjeta sin ratón. */}
      <div className={styles.track} ref={trackRef} tabIndex={0} role="group" aria-label={label}>
        {slides.map((slide, position) => (
          <div
            // La posición ES la identidad: son huecos fijos declarados en el
            // JSX de quien lo usa, no una lista que se reordene.
            key={position}
            className={styles.slide}
            role="group"
            aria-label={slideLabel(position + 1, slides.length)}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className={styles.status}>
        <span className={styles.position}>{slideLabel(index + 1, slides.length)}</span>
        <div className={styles.dots}>
          {slides.map((_, position) => (
            <button
              key={position}
              type="button"
              className={styles.dot}
              data-active={position === index ? '' : undefined}
              aria-label={slideLabel(position + 1, slides.length)}
              aria-current={position === index ? 'true' : undefined}
              onClick={() => goTo(position)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
