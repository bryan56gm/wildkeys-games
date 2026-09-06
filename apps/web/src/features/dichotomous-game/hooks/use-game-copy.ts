import { useMemo } from 'react';
import { createTranslate, type Translate } from '@wkg/i18n';
import { useLocale } from '@/app/i18n/locale';
import type { GameCopy } from '../copy';
import type { GameDefinition } from '../types';

/** Traductor del juego activo, tipado contra su propio diccionario. */
export function useGameCopy<C extends string>(
  definition: GameDefinition<C>
): Translate<GameCopy<C>> {
  const { locale } = useLocale();
  return useMemo(() => createTranslate(definition.i18n, locale), [definition, locale]);
}

/** Textos de un reto concreto, ya resueltos. */
export interface ChallengeCopy {
  readonly name: string;
  readonly caption: string;
  readonly headerSub: string;
  readonly winTitle: string;
  readonly winBody: string;
  readonly fact: string;
  readonly suspects: string;
  readonly photoPlaceholder: string;
  readonly boardTab: string;
  readonly boardKicker: string;
  remaining(count: number): string;
}

/**
 * Resuelve los textos de un reto a partir de la convención `<reto>.<clave>`.
 * Las pantallas reciben cadenas ya traducidas: no conocen el sistema de i18n
 * y se pueden renderizar en un test con textos de mentira.
 */
export function useChallengeCopy<C extends string>(
  t: Translate<GameCopy<C>>,
  challengeId: C
): ChallengeCopy {
  return useMemo(
    () => ({
      name: t(`${challengeId}.name`),
      caption: t(`${challengeId}.caption`),
      headerSub: t(`${challengeId}.headerSub`),
      winTitle: t(`${challengeId}.winTitle`),
      winBody: t(`${challengeId}.winBody`),
      fact: t(`${challengeId}.fact`),
      suspects: t(`${challengeId}.suspects`),
      photoPlaceholder: t(`${challengeId}.photoPlaceholder`),
      boardTab: t(`${challengeId}.boardTab`),
      boardKicker: t(`${challengeId}.boardKicker`),
      remaining: (count: number) => t(`${challengeId}.remainingFmt`, { n: count }),
    }),
    [t, challengeId]
  );
}

/** Textos con los que se ofrece un reto extra al ganar el anterior. */
export interface BonusCopy {
  readonly kicker: string;
  readonly title: string;
  readonly subtitle: string;
  readonly cta: string;
  readonly photoPlaceholder: string;
  readonly name: string;
}

export function useBonusCopy<C extends string>(
  t: Translate<GameCopy<C>>,
  challengeId: C
): BonusCopy {
  return useMemo(
    () => ({
      kicker: t(`${challengeId}.bonusKicker`),
      title: t(`${challengeId}.bonusTitle`),
      subtitle: t(`${challengeId}.bonusSub`),
      cta: t(`${challengeId}.bonusCta`),
      photoPlaceholder: t(`${challengeId}.photoPlaceholder`),
      name: t(`${challengeId}.name`),
      caption: t(`${challengeId}.caption`),
    }),
    [t, challengeId]
  );
}
