/**
 * URLs del juego, en un solo sitio.
 *
 * Cada pantalla tiene la suya para que el botón «atrás» del móvil navegue
 * dentro del juego —salir del marcador, volver a la portada— en vez de
 * abandonarlo, que es lo que pasaba con todo en una sola URL.
 *
 * El visor de fotos no está aquí: va como parámetro de búsqueda (`?foto=`)
 * para superponerse sin desmontar la pantalla de debajo.
 *
 * En castellano a propósito: son visibles para el jugador.
 */
export const gamePaths = {
  home: (slug: string) => `/${slug}`,
  register: (slug: string) => `/${slug}/registro`,
  play: (slug: string, challengeId: string) => `/${slug}/jugar/${challengeId}`,
  board: (slug: string, challengeId?: string) =>
    challengeId ? `/${slug}/marcador/${challengeId}` : `/${slug}/marcador`,
} as const;

/** Rutas relativas tal y como las declara el router (hijas de `/:gameSlug`). */
export const gameRoutePatterns = {
  register: 'registro',
  play: 'jugar/:challengeId',
  board: 'marcador',
  boardChallenge: 'marcador/:challengeId',
} as const;
