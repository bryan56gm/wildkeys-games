import type { AnyGameDefinition, GameDefinition } from '@/features/dichotomous-game/types';

/**
 * Frontera entre el tipado fuerte de un juego y el catálogo, que los maneja a
 * todos por igual.
 *
 * `GameCopy<'hop' | 'carn'>` describe claves concretas y `GameCopy<string>`
 * una familia de claves: TypeScript no relaciona ambas formas, aunque en
 * ejecución sean el mismo objeto plano. Este es el único punto del proyecto
 * donde se cruza esa frontera, y por eso está aquí y no repartido.
 */
function registerGame<C extends string>(definition: GameDefinition<C>): AnyGameDefinition {
  return definition as unknown as AnyGameDefinition;
}

/**
 * Catálogo de juegos de la plataforma.
 *
 * Añadir un juego = crear `src/games/<slug>/index.ts` con su `GameDefinition`
 * y registrarlo aquí. La ruta `/<slug>`, el precache y el marcador salen solos.
 * La carga es diferida: cada juego es su propio chunk y no lastra a los demás.
 */
export interface GameRegistryEntry {
  readonly slug: string;
  /** Nombre visible en la portada de la plataforma. */
  readonly title: string;
  /** Descripción corta, por idioma, para la tarjeta de la portada. */
  readonly tagline: Readonly<Record<string, string>>;
  load(): Promise<AnyGameDefinition>;
}

export const GAMES: readonly GameRegistryEntry[] = [
  {
    slug: 'lovilot',
    title: 'WildKeys × LO VILOT',
    tagline: {
      ca: 'Identifica el llúpol Vista amb una clau dicotòmica.',
      es: 'Identifica el lúpulo Vista con una clave dicotómica.',
      en: 'Identify Vista hops with a dichotomous key.',
    },
    load: async () => registerGame((await import('./lovilot')).lovilotGame),
  },
];

export function findGame(slug: string | undefined): GameRegistryEntry | undefined {
  return GAMES.find((game) => game.slug === slug);
}
