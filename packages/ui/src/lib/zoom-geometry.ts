/**
 * La geometría del pellizco, sin React ni DOM.
 *
 * Vive aparte porque es la parte que se equivoca: todos los saltos del visor
 * han salido de aquí —de un tope mal aplicado o de una escala mal proyectada—
 * y son cuentas que se pueden leer y comprobar de un vistazo, sin gestos de
 * por medio.
 */

/** Cómo está la foto: cuánto crecida y cuánto movida respecto al centro. */
export interface Transform {
  readonly scale: number;
  readonly x: number;
  readonly y: number;
}

/** El marco y el tamaño real de la foto dentro de él, ya medidos. */
export interface Box {
  readonly width: number;
  readonly height: number;
  /** Centro del marco en coordenadas de pantalla. */
  readonly cx: number;
  readonly cy: number;
  /** Tamaño de la foto sin ampliar. */
  readonly photoW: number;
  readonly photoH: number;
}

export const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };
export const MIN_SCALE = 1;
export const MAX_SCALE = 6;
/** Cuánto se deja estirar más allá del tope antes de volver solo. */
export const OVERSHOOT = 1.35;

/** Hasta dónde puede moverse la foto sin dejar ver el marco por detrás. */
export function limitsOf(box: Box, scale: number): { x: number; y: number } {
  return {
    x: Math.max(0, (box.photoW * scale - box.width) / 2),
    y: Math.max(0, (box.photoH * scale - box.height) / 2),
  };
}

/**
 * Deja pasar del tope, pero cada vez cuesta más.
 *
 * Es la curva de iOS: el primer píxel de más se nota entero y el vigésimo casi
 * nada, así que el borde se siente elástico en vez de un muro.
 */
export function rubber(value: number, limit: number, give: number): number {
  const excess = Math.abs(value) - limit;
  if (excess <= 0) return value;

  const room = give || 1;
  return Math.sign(value) * (limit + (excess * 0.55 * room) / (room + 0.55 * excess));
}

/** La misma posición, pero admitiendo pasarse del borde con resistencia. */
export function withRubber(box: Box, next: Transform): Transform {
  const limit = limitsOf(box, next.scale);
  return {
    scale: next.scale,
    x: rubber(next.x, limit.x, box.width),
    y: rubber(next.y, limit.y, box.height),
  };
}

/**
 * El sitio válido más cercano: escala dentro de los topes y foto sin bordes
 * vacíos. Es a donde vuelve la imagen al soltar.
 */
export function settledOf(box: Box, from: Transform): Transform {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, from.scale));
  if (scale === MIN_SCALE) return IDENTITY;

  const limit = limitsOf(box, scale);
  // Al cambiar la escala, el desplazamiento se ajusta en la misma proporción.
  const ratio = scale / from.scale;

  return {
    scale,
    x: Math.min(limit.x, Math.max(-limit.x, from.x * ratio)),
    y: Math.min(limit.y, Math.max(-limit.y, from.y * ratio)),
  };
}

/**
 * Dónde colocar la foto para que un punto suyo quede bajo un punto de la
 * pantalla. Es lo que mantiene quieto lo que hay entre los dedos.
 */
export function placeFocus(
  box: Box,
  focus: { x: number; y: number },
  screen: { x: number; y: number },
  scale: number
): Transform {
  return {
    scale,
    x: screen.x - box.cx - focus.x * scale,
    y: screen.y - box.cy - focus.y * scale,
  };
}

/** Qué punto de la foto hay ahora mismo bajo un punto de la pantalla. */
export function focusAt(
  box: Box,
  view: Transform,
  screen: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: (screen.x - box.cx - view.x) / view.scale,
    y: (screen.y - box.cy - view.y) / view.scale,
  };
}

/** Dos posiciones que el ojo no distingue. */
export function same(a: Transform, b: Transform): boolean {
  return (
    Math.abs(a.scale - b.scale) < 0.001 && Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5
  );
}
