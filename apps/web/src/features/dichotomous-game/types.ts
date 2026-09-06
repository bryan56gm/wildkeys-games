import type { DichotomousKey } from '@wkg/game-engine';
import type { I18nBundle } from '@wkg/i18n';
import type { Locale } from '@/app/i18n/locale';
import type { GameCopy } from './copy';

/**
 * Foto de un objetivo. `src` es opcional a propósito: mientras no exista la
 * fotografía real, la pantalla muestra un marcador con su texto alternativo en
 * lugar de un hueco roto.
 */
export interface PhotoRef {
  readonly src?: string;
}

/** Un reto dentro de un juego: una clave y una rejilla de especies. */
export interface ChallengeDefinition<C extends string> {
  readonly id: C;
  readonly key: DichotomousKey<Locale>;
  /** Columnas de la rejilla de especies; depende de cuántas haya. */
  readonly speciesColumns: number;
  /** Si es `true`, se ofrece como reto extra al ganar el reto anterior. */
  readonly bonus?: boolean;
}

/** Marca de ejemplo, para que el marcador no aparezca vacío el primer día. */
export interface DemoScore<C extends string> {
  readonly challenge: C;
  readonly name: string;
  readonly elapsedMs: number;
  readonly fails: number;
}

/** Colaborador del juego (LO VILOT en el primero). */
export interface SponsorDefinition {
  readonly name: string;
  readonly logoSrc: string;
}

/**
 * Todo lo que define un juego de la plataforma: contenido, textos, tema y
 * assets. No contiene lógica: la aporta `dichotomous-game` y el motor.
 *
 * Para añadir un juego nuevo basta con crear uno de estos en
 * `src/games/<slug>/` y registrarlo en `src/games/registry.ts`.
 */
export interface GameDefinition<C extends string = string> {
  readonly slug: string;
  /** Clase CSS que redefine los tokens de `@wkg/ui` con la paleta del juego. */
  readonly themeClass: string;
  readonly i18n: I18nBundle<Locale, GameCopy<C>>;
  /** El primero es el reto principal; los marcados `bonus` se encadenan. */
  readonly challenges: readonly ChallengeDefinition<C>[];
  readonly sponsor?: SponsorDefinition;
  /** Enlace de cierre a la marca (wildkeys.io). */
  readonly externalCtaHref: string;
  readonly demoScores?: readonly DemoScore<C>[];
  /**
   * Fotografía de cada especie, indexada por su id.
   *
   * Vive en la definición del juego y no en el motor: éste trabaja con datos
   * puros y no debe saber que existen imágenes. Una especie sin foto muestra
   * su marcador con el texto alternativo, así que faltar una no rompe nada.
   */
  readonly speciesPhotos?: Readonly<Record<string, string>>;
  /** Duración de la pantalla de carga, en ms. */
  readonly splashDurationMs?: number;
}

/** Definición sin conocer sus retos: la forma con la que viaja por el router. */
export type AnyGameDefinition = GameDefinition<string>;
