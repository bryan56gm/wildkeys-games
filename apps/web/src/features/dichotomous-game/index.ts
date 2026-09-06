/**
 * Plantilla de juego de clave dicotómica: todas las pantallas y el flujo,
 * parametrizados por una `GameDefinition`.
 */
export { GameLayout } from './GameLayout';
export { validateGameDefinition } from './validate-definition';
export type { CommonCopy, GameCopy, ChallengeCopyKey, BonusCopyKey } from './copy';
export type {
  AnyGameDefinition,
  ChallengeDefinition,
  DemoScore,
  GameDefinition,
  PhotoRef,
  SponsorDefinition,
} from './types';
