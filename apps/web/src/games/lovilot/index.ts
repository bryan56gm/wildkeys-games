import type { GameDefinition } from '@/features/dichotomous-game/types';
import lovilotLogo from './assets/lovilot-logo.webp';
import { speciesPhotos } from './species-photos';
import { carnivoreKey } from './content/carnivore-key';
import { hopKey } from './content/hop-key';
import { lovilotBundle, type LovilotChallenge } from './i18n';
import theme from './theme.module.css';

/**
 * WildKeys × LO VILOT — primer juego de la plataforma.
 *
 * Aquí solo hay configuración y contenido: claves, textos, tema y assets. Toda
 * la mecánica la ponen `@wkg/game-engine` y `features/dichotomous-game`.
 *
 * Las fotos se recogen solas de `assets/species/`: el nombre del fichero es el
 * id de la especie (`vista.webp`). Añadir una es soltarla ahí, sin tocar
 * código; una especie sin foto muestra su marcador y no rompe nada.
 */
export const lovilotGame: GameDefinition<LovilotChallenge> = {
  slug: 'lovilot',
  themeClass: theme.theme ?? '',
  i18n: lovilotBundle,
  externalCtaHref: 'https://wildkeys.io',
  splashDurationMs: 8_200,

  sponsor: {
    name: 'LO VILOT',
    logoSrc: lovilotLogo,
  },

  speciesPhotos,

  challenges: [
    { id: 'hop', key: hopKey, speciesColumns: 3 },
    { id: 'carn', key: carnivoreKey, speciesColumns: 4, bonus: true },
  ],

  // El evento juega con marcas reales: el marcador arranca vacio y se llena
  // con lo que publiquen los participantes. Sin filas de ejemplo.
  demoScores: [],
};

export default lovilotGame;
