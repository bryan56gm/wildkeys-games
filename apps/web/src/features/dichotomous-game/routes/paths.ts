/**
 * URLs del juego, en un solo sitio.
 *
 * Cada pantalla tiene la suya para que el botón «atrás» del móvil navegue
 * dentro del juego —cerrar el zoom, salir del marcador, volver a la portada—
 * en vez de abandonarlo, que es lo que pasaba con todo en una sola URL.
 *
 * En castellano a propósito: son visibles para el jugador.
 */
export const gamePaths = {
  home: (slug: string) => `/${slug}`,
  register: (slug: string) => `/${slug}/registro`,
  play: (slug: string, challengeId: string) => `/${slug}/jugar/${challengeId}`,
  zoom: (slug: string, challengeId: string) => `/${slug}/jugar/${challengeId}/foto`,
  board: (slug: string, challengeId?: string) =>
    challengeId ? `/${slug}/marcador/${challengeId}` : `/${slug}/marcador`,
} as const;

/** Rutas relativas tal y como las declara el router (hijas de `/:gameSlug`). */
export const gameRoutePatterns = {
  register: 'registro',
  play: 'jugar/:challengeId',
  zoom: 'jugar/:challengeId/foto',
  board: 'marcador',
  boardChallenge: 'marcador/:challengeId',
} as const;
