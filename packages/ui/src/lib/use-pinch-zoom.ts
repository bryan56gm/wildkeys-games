import { useCallback, useEffect, useRef, useState } from 'react';

/** Cómo está la foto: cuánto crecida y cuánto movida respecto al centro. */
interface Transform {
  readonly scale: number;
  readonly x: number;
  readonly y: number;
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

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const TOGGLE_SCALE = 2.5;
/** Cuánto se deja estirar más allá del tope antes de volver solo. */
const OVERSHOOT = 1.35;
/** Un toque que dure más o se mueva más ya no es un toque, es un arrastre. */
const TAP_MS = 250;
const TAP_SLOP = 12;
/** Ventana para el segundo toque del doble toque. */
const DOUBLE_TAP_MS = 300;
const EASE_MS = 240;

const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

/**
 * Pellizcar para acercar y arrastrar para mover, como en la galería del móvil.
 *
 * Cuatro decisiones sostienen que se sienta natural. Las tres primeras son las
 * que separan un pellizco que «salta» de uno que no:
 *
 * 1. **Cada fotograma se calcula desde el inicio del gesto, no desde el
 *    fotograma anterior.** Al empezar se guarda qué punto de la foto hay bajo
 *    los dedos, y en cada movimiento se coloca la foto para que ese punto siga
 *    exactamente ahí. Encadenando incrementos, el error se acumula y la imagen
 *    se va sola.
 * 2. **El tope no es un muro.** Pasado el límite la foto sigue, pero cada vez
 *    más a regañadientes, y al soltar vuelve a su sitio con una animación. Un
 *    recorte en seco se siente como un fallo.
 * 3. **El doble toque se decide al levantar el dedo**, y solo si de verdad fue
 *    un toque: corto, quieto y con un solo dedo. Decidiéndolo al apoyar, el
 *    primer dedo de un pellizco contaba como segundo toque del anterior y la
 *    foto pegaba un salto a media ampliación.
 * 4. **El gesto no pasa por React.** La transformación se escribe en el
 *    elemento dentro de un `requestAnimationFrame`. Un `setState` por cada
 *    movimiento —llegan más rápido que los fotogramas— hace que la imagen
 *    persiga al dedo con retraso.
 *
 * El gesto se atrapa aquí en vez de dejárselo al navegador: el pellizco nativo
 * agranda la página entera, no la foto, y dentro de un diálogo a pantalla
 * completa eso lo descoloca todo. En Android basta `touch-action: none`;
 * Safari necesita además que se le paren sus propios eventos de gesto.
 */
export function usePinchZoom(): PinchZoom {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [content, setContent] = useState<HTMLImageElement | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const view = useRef<Transform>(IDENTITY);
  /** Marco y tamaño real de la foto, medidos al empezar cada gesto. */
  const box = useRef({ width: 0, height: 0, cx: 0, cy: 0, photoW: 0, photoH: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  /** El gesto en curso, congelado tal y como empezó. */
  const origin = useRef<{
    view: Transform;
    distance: number;
    center: { x: number; y: number };
    /** Punto de la foto que había bajo los dedos, en unidades sin escalar. */
    focus: { x: number; y: number };
  } | null>(null);
  const tap = useRef({ at: 0, x: 0, y: 0, moved: false, multi: false, last: 0 });
  const painting = useRef(0);
  const animation = useRef(0);

  const paint = useCallback(() => {
    if (!content || painting.current) return;
    painting.current = requestAnimationFrame(() => {
      painting.current = 0;
      const { scale, x, y } = view.current;
      // `translate3d` para que el navegador le dé su propia capa.
      content.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    });
  }, [content]);

  const measure = useCallback(() => {
    if (!frame || !content) return;
    const rect = frame.getBoundingClientRect();
    const photo = content.getBoundingClientRect();
    box.current = {
      width: rect.width,
      height: rect.height,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
      // El rect de la foto ya viene escalado: se deshace para tener la base.
      photoW: photo.width / view.current.scale,
      photoH: photo.height / view.current.scale,
    };
  }, [content, frame]);

  const commit = useCallback(
    (next: Transform) => {
      view.current = next;
      paint();
      setZoomed(next.scale > MIN_SCALE + 0.01);
    },
    [paint]
  );

  /** Lleva la foto a un sitio válido con una animación que se puede cortar. */
  const settle = useCallback(
    (target: Transform, duration = EASE_MS) => {
      cancelAnimationFrame(animation.current);

      const from = view.current;
      if (same(from, target)) return commit(target);

      const started = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - started) / duration);
        const k = 1 - (1 - t) ** 3; // desacelera al final, como el sistema

        commit({
          scale: from.scale + (target.scale - from.scale) * k,
          x: from.x + (target.x - from.x) * k,
          y: from.y + (target.y - from.y) * k,
        });

        if (t < 1) animation.current = requestAnimationFrame(step);
      };

      animation.current = requestAnimationFrame(step);
    },
    [commit]
  );

  /** El sitio válido más cercano al que está ahora. */
  const settled = useCallback((from: Transform): Transform => {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, from.scale));
    if (scale === MIN_SCALE) return IDENTITY;

    const { width, height, photoW, photoH } = box.current;
    const maxX = Math.max(0, (photoW * scale - width) / 2);
    const maxY = Math.max(0, (photoH * scale - height) / 2);
    // Al cambiar la escala, el desplazamiento se ajusta en la misma proporción.
    const ratio = scale / from.scale;

    return {
      scale,
      x: Math.min(maxX, Math.max(-maxX, from.x * ratio)),
      y: Math.min(maxY, Math.max(-maxY, from.y * ratio)),
    };
  }, []);

  /** Deja pasar del tope, pero cada vez cuesta más. */
  const rubber = useCallback((value: number, limit: number): number => {
    const excess = Math.abs(value) - limit;
    if (excess <= 0) return value;

    const give = box.current.width || 1;
    const eased = (excess * 0.55 * give) / (give + 0.55 * excess);
    return Math.sign(value) * (limit + eased);
  }, []);

  const bounded = useCallback(
    (next: Transform): Transform => {
      const { width, height, photoW, photoH } = box.current;
      const maxX = Math.max(0, (photoW * next.scale - width) / 2);
      const maxY = Math.max(0, (photoH * next.scale - height) / 2);

      return { scale: next.scale, x: rubber(next.x, maxX), y: rubber(next.y, maxY) };
    },
    [rubber]
  );

  const zoomAt = useCallback(
    (scale: number, point?: { clientX: number; clientY: number }) => {
      if (!content) return;
      measure();

      const from = view.current;
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
      if (next === from.scale) return;

      const px = point ? point.clientX - box.current.cx : 0;
      const py = point ? point.clientY - box.current.cy : 0;
      const focusX = (px - from.x) / from.scale;
      const focusY = (py - from.y) / from.scale;

      settle(settled({ scale: next, x: px - focusX * next, y: py - focusY * next }));
    },
    [content, measure, settle, settled]
  );

  const reset = useCallback(() => settle(IDENTITY), [settle]);

  const toggle = useCallback(
    (point?: { clientX: number; clientY: number }) => {
      if (view.current.scale > MIN_SCALE + 0.01) return reset();
      zoomAt(TOGGLE_SCALE, point);
    },
    [reset, zoomAt]
  );

  useEffect(() => {
    if (!frame) return;

    const active = pointers.current;

    const spanOf = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
      distance: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)),
      center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
    });

    /** Congela el gesto: desde aquí se calcula cada fotograma. */
    const anchor = () => {
      const [a, b] = [...active.values()];
      if (!a) return;
      measure();

      const span = b ? spanOf(a, b) : { distance: 1, center: a };
      const from = view.current;

      origin.current = {
        view: from,
        distance: span.distance,
        center: span.center,
        focus: {
          x: (span.center.x - box.current.cx - from.x) / from.scale,
          y: (span.center.y - box.current.cy - from.y) / from.scale,
        },
      };
    };

    const onDown = (event: PointerEvent) => {
      cancelAnimationFrame(animation.current);
      active.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (active.size === 1) {
        tap.current = {
          ...tap.current,
          at: Date.now(),
          x: event.clientX,
          y: event.clientY,
          moved: false,
          multi: false,
        };
      } else {
        // Con dos dedos ya no hay toque que valga.
        tap.current.multi = true;
        tap.current.last = 0;
      }

      anchor();
    };

    const onMove = (event: PointerEvent) => {
      if (!active.has(event.pointerId) || !origin.current) return;

      active.set(event.pointerId, { x: event.clientX, y: event.clientY });

      const [a, b] = [...active.values()];
      if (!a) return;

      if (Math.hypot(event.clientX - tap.current.x, event.clientY - tap.current.y) > TAP_SLOP) {
        tap.current.moved = true;
      }

      const base = origin.current;
      const { cx, cy } = box.current;

      if (b) {
        event.preventDefault();

        const span = spanOf(a, b);
        const raw = base.view.scale * (span.distance / base.distance);
        // Se deja pasar de los topes, pero con resistencia.
        const scale = Math.min(MAX_SCALE * OVERSHOOT, Math.max(MIN_SCALE / OVERSHOOT, raw));

        commit(
          bounded({
            scale,
            // El punto que había bajo los dedos sigue bajo los dedos.
            x: span.center.x - cx - base.focus.x * scale,
            y: span.center.y - cy - base.focus.y * scale,
          })
        );
        return;
      }

      if (base.view.scale > MIN_SCALE + 0.01) {
        event.preventDefault();
        commit(
          bounded({
            scale: base.view.scale,
            x: base.view.x + (a.x - base.center.x),
            y: base.view.y + (a.y - base.center.y),
          })
        );
      }
    };

    const onUp = (event: PointerEvent) => {
      active.delete(event.pointerId);

      const wasTap =
        active.size === 0 &&
        !tap.current.multi &&
        !tap.current.moved &&
        Date.now() - tap.current.at < TAP_MS;

      if (wasTap) {
        const now = Date.now();
        if (now - tap.current.last < DOUBLE_TAP_MS) {
          tap.current.last = 0;
          toggle(event);
          return;
        }
        tap.current.last = now;
      }

      // Quedan dedos: el gesto sigue, pero desde donde está ahora.
      if (active.size > 0) return anchor();

      origin.current = null;
      settle(settled(view.current));
    };

    // Safari hace su propio zoom aunque `touch-action` diga que no.
    const stop = (event: Event) => event.preventDefault();

    frame.addEventListener('pointerdown', onDown);
    frame.addEventListener('gesturestart', stop);
    frame.addEventListener('gesturechange', stop);
    frame.addEventListener('gestureend', stop);
    frame.addEventListener('dblclick', stop);
    window.addEventListener('pointermove', onMove, { passive: false });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    return () => {
      frame.removeEventListener('pointerdown', onDown);
      frame.removeEventListener('gesturestart', stop);
      frame.removeEventListener('gesturechange', stop);
      frame.removeEventListener('gestureend', stop);
      frame.removeEventListener('dblclick', stop);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      active.clear();
      origin.current = null;
      cancelAnimationFrame(painting.current);
      cancelAnimationFrame(animation.current);
    };
  }, [bounded, commit, frame, measure, settle, settled, toggle]);

  // Al girar el móvil cambian marco y foto: lo medido deja de valer.
  useEffect(() => {
    if (!frame) return;
    const observer = new ResizeObserver(() => {
      measure();
      settle(settled(view.current), 0);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, [frame, measure, settle, settled]);

  return {
    attachFrame: setFrame,
    attachContent: setContent,
    zoomed,
    zoomBy: useCallback((factor: number) => zoomAt(view.current.scale * factor), [zoomAt]),
    toggle,
    reset,
  };
}

function same(a: Transform, b: Transform): boolean {
  return (
    Math.abs(a.scale - b.scale) < 0.001 && Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5
  );
}
