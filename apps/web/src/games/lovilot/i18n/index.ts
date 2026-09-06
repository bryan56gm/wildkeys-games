import type { I18nBundle } from '@wkg/i18n';
import { FALLBACK_LOCALE, type Locale } from '@/app/i18n/locale';
import { ca } from './ca';
import { en } from './en';
import { es } from './es';
import type { LovilotCopy } from './types';

/** Diccionarios del juego LO VILOT, aislados de los de cualquier otro juego. */
export const lovilotBundle: I18nBundle<Locale, LovilotCopy> = {
  namespace: 'lovilot',
  fallbackLocale: FALLBACK_LOCALE,
  dictionaries: { ca, es, en },
};

export type { LovilotChallenge, LovilotCopy } from './types';
