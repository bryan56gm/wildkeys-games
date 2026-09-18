import { useCallback, useEffect, useRef, useState } from 'react';

/** Cómo está la imagen: cuánto crecida y cuánto movida. */
interface Transform {
  scale: number;
  x: number;
  y: number;
}

export interface PinchZoom {
  /**
   * Engancha el marco que recibe los gestos y el elemento que se mueve dentro.
   *
   * Son funciones y no objetos `ref` porque el marco hace falta **en cuanto
   * existe** —para colgarle los escuchadores— y un objeto `ref` no avisa a
   * nadie de que ya está montado.
   */
  attachFrame(element: HTMLDivElement | null): void;
  attachContent(element: HTMLImageElement | null): void;
  /** Solo para pintar: el gesto no pasa por el estado de React. */
  readonly zoomed: boolean;
  /** Acerca o aleja desde el centro, con animación; botones y teclado. */
  zoomBy(factor: number): void;
  /** Alterna entre encajada y acercada, en el punto que se toque. */
  toggle(point?: { clientX: number; clientY: number }): void;
  reset(): void;
}

/**
 * Anima el siguiente cambio y se quita sola.
 *
 * Vive fuera del hook porque toca el DOM a mano: dejar una transición puesta
 * mientras los dedos arrastran hace que la imagen persiga al dedo con retraso,
 * que es como se ve el «parpadeo».
 */
function easeOnce(element: HTMLElement, duration: number): void {
  element.style.transition = `transform ${duration}ms ease-out`;
  window.setTimeout(() => {
    element.style.transition = '';
  }, duration);
}

/** Quita cualquier transición pendiente: el gesto manda sobre la animación. */
function stopEase(element: HTMLElement | null): void {
  if (element) element.style.transition = '';
}

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const TOGGLE_SCALE = 2.5;
/** Dos toques seguidos dentro de esta ventana son un doble toque. */
const DOUBLE_TAP_MS = 320;
/** Lo que dura el acercamiento con botón o doble toque. */
const EASE_MS = 200;

/**
 * Pellizcar para acercar y arrastrar para mover, como en la galería del móvil.
 *
 * Dos decisiones sostienen que vaya suave, y las dos van contra el instinto de
 * «guardarlo en el estado»:
 *
 * 1. **El gesto no pasa por React.** La transformación se escribe directamente
 *    en el elemento dentro de un `requestAnimationFrame`. Con un `setState`
 *    por cada `pointermove` —que llegan más rápido que los fotogramas— React
 *    no da abasto: la imagen pega tirones y parpadea. Al estado solo sube si
 *    la foto está acercada o no, que es lo único que se pinta.
 * 2. **Las medidas se toman una vez, al empezar.** Preguntar por el tamaño del
 *    marco en cada movimiento obliga al navegador a recalcular la maqueta
 *    entera, y ese es el otro origen de los tirones.
 *
 * El gesto se atrapa aquí (con `touch-action: none` en el marco) en lugar de
 * dejárselo al navegador: el pellizco nativo agranda la página entera, no la
 * foto, y dentro de un diálogo a pantalla completa eso lo descoloca todo.
 *
 * Nada de `setPointerCapture`: al llegar el segundo dedo lanzaba
 * `NotFoundError` y se llevaba por delante la pantalla. Los punteros se llevan
 * en un mapa y el movimiento se escucha en la ventana, así que el gesto
 * sobrevive a que un dedo se salga del marco.
 */
export function usePinchZoom(): PinchZoom {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [content, setContent] = useState<HTMLImageElement | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const transform = useRef<Transform>({ scale: 1, x: 0, y: 0 });
  /** Marco y tamaño real de la foto, medidos al empezar cada gesto. */
  const bounds = useRef({ width: 0, height: 0, left: 0, top: 0, photoW: 0, photoH: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; center: { x: number; y: number } } | null>(null);
  const frameRequest = useRef(0);
  const lastTap = useRef(0);

  /** Escribe la transformación en el DOM, una vez por fotograma. */
  const paint = useCallback(() => {
    if (!content || frameRequest.current) return;
    frameRequest.current = requestAnimationFrame(() => {
      frameRequest.current = 0;
      const { scale, x, y } = transform.current;
      // `translate3d` para que el navegador le dé su propia capa.
      content.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    });
  }, [content]);

  /** Mide el marco y la foto. Solo al empezar un gesto o al cambiar el tamaño. */
  const measure = useCallback(() => {
    if (!frame || !content) return;
    const box = frame.getBoundingClientRect();
    const photo = content.getBoundingClientRect();
    bounds.current = {
      width: box.width,
      height: box.height,
      left: box.left,
      top: box.top,
      // El rect de la foto ya viene escalado: se deshace para tener la base.
      photoW: photo.width / transform.current.scale,
      photoH: photo.height / transform.current.scale,
    };
  }, [content, frame]);

  /** Mantiene la foto dentro del marco: ni bordes vacíos ni huidas. */
  const clamp = useCallback((next: Transform): Transform => {
    const { width, height, photoW, photoH } = bounds.current;
    const maxX = Math.max(0, (photoW * next.scale - width) / 2);
    const maxY = Math.max(0, (photoH * next.scale - height) / 2);

    return {
      scale: next.scale,
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }, []);

  const apply = useCallback(
    (next: Transform) => {
      transform.current = clamp(next);
      paint();
      setZoomed(transform.current.scale > MIN_SCALE);
    },
    [clamp, paint]
  );

  /** Acerca dejando quieto el punto que se toca: así el gesto no salta. */
  const zoomAt = useCallback(
    (scale: number, origin?: { clientX: number; clientY: number }, animate = false) => {
      if (!content) return;
      measure();

      const current = transform.current;
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
      if (next === current.scale) return;

      const { left, top, width, height } = bounds.current;
      const px = origin ? origin.clientX - (left + width / 2) : 0;
      const py = origin ? origin.clientY - (top + height / 2) : 0;
      const ratio = next / current.scale;

      if (animate) easeOnce(content, EASE_MS);

      apply(
        next === MIN_SCALE
          ? { scale: 1, x: 0, y: 0 }
          : { scale: next, x: px + (current.x - px) * ratio, y: py + (current.y - py) * ratio }
      );
    },
    [apply, content, measure]
  );

  const reset = useCallback(() => {
    if (!content) return;
    easeOnce(content, EASE_MS);
    apply({ scale: 1, x: 0, y: 0 });
  }, [apply, content]);

  const toggle = useCallback(
    (point?: { clientX: number; clientY: number }) => {
      if (transform.current.scale > MIN_SCALE) return reset();
      zoomAt(TOGGLE_SCALE, point, true);
    },
    [reset, zoomAt]
  );

  /* Un dedo arrastra (solo con la foto acercada); dos pellizcan. */
  useEffect(() => {
    if (!frame) return;

    const active = pointers.current;
    const of = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
      distance: Math.hypot(a.x - b.x, a.y - b.y),
      center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    });

    const onDown = (event: PointerEvent) => {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      // Nada de transición mientras hay dedos encima: la transición y el gesto
      // tirando del mismo valor es lo que se ve como parpadeo.
      stopEase(content);
      measure();

      const [a, b] = [...pointers.current.values()];

      if (pointers.current.size === 1) {
        const now = Date.now();
        if (now - lastTap.current < DOUBLE_TAP_MS) {
          toggle(event);
          lastTap.current = 0;
        } else {
          lastTap.current = now;
        }
        return;
      }

      if (a && b) pinch.current = of(a, b);
    };

    const onMove = (event: PointerEvent) => {
      const previous = pointers.current.get(event.pointerId);
      if (!previous) return;

      const point = { x: event.clientX, y: event.clientY };
      pointers.current.set(event.pointerId, point);

      const [a, b] = [...pointers.current.values()];
      const current = transform.current;

      if (a && b && pinch.current) {
        event.preventDefault();

        const { distance, center } = of(a, b);
        const base = pinch.current;
        const scale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, current.scale * (distance / base.distance))
        );
        const ratio = scale / current.scale;
        const { left, top, width, height } = bounds.current;
        const px = center.x - (left + width / 2);
        const py = center.y - (top + height / 2);

        apply({
          scale,
          // Pellizcar acerca y, a la vez, mover la mano arrastra la foto.
          x: px + (current.x - px) * ratio + (center.x - base.center.x),
          y: py + (current.y - py) * ratio + (center.y - base.center.y),
        });

        pinch.current = { distance, center };
        return;
      }

      if (current.scale > MIN_SCALE && a) {
        event.preventDefault();
        apply({
          scale: current.scale,
          x: current.x + (point.x - previous.x),
          y: current.y + (point.y - previous.y),
        });
      }
    };

    const onUp = (event: PointerEvent) => {
      pointers.current.delete(event.pointerId);
      if (pointers.current.size < 2) pinch.current = null;
      // Al levantar un dedo del pellizco, el que queda arrastra desde donde
      // está: sin esto la foto pegaría un salto.
      if (pointers.current.size === 1) measure();
    };

    frame.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      frame.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      active.clear();
      pinch.current = null;
      cancelAnimationFrame(frameRequest.current);
    };
  }, [apply, content, frame, measure, toggle]);

  // Al girar el móvil cambian marco y foto: lo medido deja de valer.
  useEffect(() => {
    if (!frame) return;
    const observer = new ResizeObserver(measure);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frame, measure]);

  return {
    attachFrame: setFrame,
    attachContent: setContent,
    zoomed,
    zoomBy: useCallback(
      (factor: number) => zoomAt(transform.current.scale * factor, undefined, true),
      [zoomAt]
    ),
    toggle,
    reset,
  };
}
