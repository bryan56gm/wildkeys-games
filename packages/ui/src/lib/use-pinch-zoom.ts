import { useCallback, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

/** Encaje de la imagen dentro del visor. */
export interface ZoomState {
  readonly scale: number;
  readonly x: number;
  readonly y: number;
}

const RESET: ZoomState = { scale: 1, x: 0, y: 0 };
const MIN_SCALE = 1;
const MAX_SCALE = 4;
/** Al tocar dos veces se acerca hasta aquí; otro toque devuelve al encaje. */
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_MS = 300;

export interface PinchZoomResult {
  readonly state: ZoomState;
  readonly zoomed: boolean;
  /** Props a repartir sobre el contenedor que recibe los gestos. */
  readonly handlers: {
    onPointerDown(event: ReactPointerEvent<HTMLElement>): void;
    onPointerMove(event: ReactPointerEvent<HTMLElement>): void;
    onPointerUp(event: ReactPointerEvent<HTMLElement>): void;
    onPointerCancel(event: ReactPointerEvent<HTMLElement>): void;
  };
  reset(): void;
  toggle(): void;
}

/**
 * Acercar y desplazar una imagen con los dedos, sin librerías.
 *
 * Usa Pointer Events, así que ratón y dedo van por el mismo camino. Dos dedos
 * pellizcan, uno arrastra, y dos toques seguidos alternan entre encajada y
 * acercada.
 *
 * El desplazamiento se recorta siempre contra el tamaño real del contenedor:
 * la imagen no puede escaparse dejando la pantalla en negro, que es lo que
 * hace que un visor se sienta roto.
 */
export function usePinchZoom(): PinchZoomResult {
  const [state, setState] = useState<ZoomState>(RESET);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ distance: number; scale: number } | null>(null);
  const lastTap = useRef(0);

  /** Impide que la imagen se salga: a escala 1 no se mueve; al ampliar, solo
   *  hasta donde queda borde por descubrir. */
  const clamp = useCallback((next: ZoomState, element: HTMLElement | null): ZoomState => {
    const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next.scale));
    if (!element || scale <= 1) return { scale, x: 0, y: 0 };

    const { width, height } = element.getBoundingClientRect();
    const limitX = (width * (scale - 1)) / 2 / scale;
    const limitY = (height * (scale - 1)) / 2 / scale;
    return {
      scale,
      x: Math.min(limitX, Math.max(-limitX, next.x)),
      y: Math.min(limitY, Math.max(-limitY, next.y)),
    };
  }, []);

  const onPointerDown = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.current.size === 1) {
      const now = Date.now();
      if (now - lastTap.current < DOUBLE_TAP_MS) {
        setState((current) =>
          current.scale > 1 ? RESET : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 }
        );
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }
  }, []);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const previous = pointers.current.get(event.pointerId);
      if (!previous) return;
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      const points = [...pointers.current.values()];
      const element = event.currentTarget;

      if (points.length >= 2 && points[0] && points[1]) {
        const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
        gesture.current ??= { distance, scale: state.scale };
        const factor = distance / (gesture.current.distance || distance);
        setState((current) =>
          clamp({ ...current, scale: gesture.current!.scale * factor }, element)
        );
        return;
      }

      // Un solo dedo: arrastrar, y solo si hay algo que descubrir.
      if (state.scale <= 1) return;
      setState((current) =>
        clamp(
          {
            ...current,
            x: current.x + (event.clientX - previous.x) / current.scale,
            y: current.y + (event.clientY - previous.y) / current.scale,
          },
          element
        )
      );
    },
    [clamp, state.scale]
  );

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) gesture.current = null;
  }, []);

  return {
    state,
    zoomed: state.scale > 1,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
    reset: useCallback(() => setState(RESET), []),
    toggle: useCallback(
      () =>
        setState((current) =>
          current.scale > 1 ? RESET : { scale: DOUBLE_TAP_SCALE, x: 0, y: 0 }
        ),
      []
    ),
  };
}
