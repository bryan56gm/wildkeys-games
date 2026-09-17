import { useCallback, useEffect, useRef, useState } from 'react';

export interface CarouselControls {
  /** Pista con scroll: es el elemento que se desplaza. */
  readonly trackRef: React.RefObject<HTMLDivElement | null>;
  /** Diapositiva visible ahora mismo, empezando en 0. */
  readonly index: number;
  /** Queda contenido a un lado u otro; de ahí salen los degradados del borde. */
  readonly atStart: boolean;
  readonly atEnd: boolean;
  goTo(index: number): void;
}

/**
 * Posición de un carrusel con scroll nativo.
 *
 * El desplazamiento lo hace el navegador —con su inercia, su scroll-snap y su
 * accesibilidad—, así que aquí no se anima nada: solo se lee dónde ha quedado
 * para poder pintar los indicadores. Reimplementar el arrastre a mano es lo que
 * hace que un carrusel se sienta peor que el scroll del sistema, no mejor.
 */
export function useCarousel(count: number): CarouselControls {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(count <= 1);

  const read = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.firstElementChild as HTMLElement | null;
    const step = slide ? slide.offsetWidth + gapOf(track) : track.clientWidth;
    const maxScroll = track.scrollWidth - track.clientWidth;

    setIndex(step > 0 ? clamp(Math.round(track.scrollLeft / step), 0, count - 1) : 0);
    setAtStart(track.scrollLeft <= EDGE_SLACK);
    setAtEnd(track.scrollLeft >= maxScroll - EDGE_SLACK);
  }, [count]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    read();
    // `passive`: leer la posición nunca debe retrasar el scroll del dedo.
    track.addEventListener('scroll', read, { passive: true });
    // El ancho de las diapositivas depende del de la pista: al girar el móvil
    // cambian los dos, y los indicadores tienen que seguir cuadrando.
    const observer = new ResizeObserver(read);
    observer.observe(track);

    return () => {
      track.removeEventListener('scroll', read);
      observer.disconnect();
    };
  }, [read]);

  const goTo = useCallback((target: number) => {
    const track = trackRef.current;
    const slide = track?.children[target] as HTMLElement | undefined;
    if (!track || !slide) return;
    track.scrollTo({ left: slide.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }, []);

  return { trackRef, index, atStart, atEnd, goTo };
}

/** Holgura en píxeles: el scroll rara vez cae en el 0 o el máximo exactos. */
const EDGE_SLACK = 2;

function gapOf(track: HTMLElement): number {
  return Number.parseFloat(getComputedStyle(track).columnGap) || 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
