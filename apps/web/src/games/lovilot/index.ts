import type { GameDefinition } from '@/features/dichotomous-game/types';
import lovilotLogo from './assets/lovilot-logo.webp';
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
 * Las fotos de los objetivos aún no existen; en cuanto estén, se dejan en
 * `assets/` y se referencian en `photo.src`. Mientras tanto la pantalla pinta
 * un marcador con el texto de `<reto>.photoPlaceholder`.
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

  challenges: [
    {
      id: 'hop',
      key: hopKey,
      photo: {},
      speciesColumns: 3,
    },
    {
      id: 'carn',
      key: carnivoreKey,
      photo: {},
      speciesColumns: 4,
      bonus: true,
    },
  ],

  // Filas de ejemplo para que el marcador no salga vacío al abrir el evento.
  // Se distinguen con la etiqueta "demo" y no cuentan como marcas reales.
  demoScores: [
    { challenge: 'hop', name: 'Equip Linx', elapsedMs: 38_000, fails: 0 },
    { challenge: 'hop', name: 'Nuria & Pau', elapsedMs: 51_000, fails: 1 },
    { challenge: 'hop', name: 'Marc', elapsedMs: 64_000, fails: 1 },
    { challenge: 'hop', name: 'Família Ortiz', elapsedMs: 82_000, fails: 2 },
    { challenge: 'carn', name: 'Equip Linx', elapsedMs: 71_000, fails: 0 },
    { challenge: 'carn', name: 'Nuria & Pau', elapsedMs: 96_000, fails: 1 },
    { challenge: 'carn', name: 'Los Rastreadores', elapsedMs: 118_000, fails: 1 },
    { challenge: 'carn', name: 'Marc', elapsedMs: 134_000, fails: 2 },
    { challenge: 'carn', name: 'Escola Bosc', elapsedMs: 167_000, fails: 3 },
  ],
};

export default lovilotGame;
