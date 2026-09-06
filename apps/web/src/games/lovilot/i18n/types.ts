import type { GameCopy } from '@/features/dichotomous-game/copy';

/** Retos de LO VILOT: el lúpulo y, como extra, los carnívoros. */
export type LovilotChallenge = 'hop' | 'carn';

/** Diccionario completo del juego, con todas las claves que exige la plantilla. */
export type LovilotCopy = GameCopy<LovilotChallenge>;
