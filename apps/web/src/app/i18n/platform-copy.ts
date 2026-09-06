import { createI18n, type I18nBundle } from '@wkg/i18n';
import { FALLBACK_LOCALE, useLocale, type Locale } from './locale';

/**
 * Textos del "cascarón" de la plataforma: portada, errores y estados que no
 * pertenecen a ningún juego. Cada juego trae su propio diccionario aparte.
 */
export interface PlatformCopy {
  platformTitle: string;
  platformSubtitle: string;
  gamesKicker: string;
  play: string;
  notFoundTitle: string;
  notFoundBody: string;
  backHome: string;
  loading: string;
  errorTitle: string;
  errorBody: string;
  retry: string;
  langLabel: string;
}

const ca: PlatformCopy = {
  platformTitle: 'WildKeys Games',
  platformSubtitle: 'Minijocs per aprendre a identificar espècies amb claus dicotòmiques.',
  gamesKicker: 'Jocs disponibles',
  play: 'Jugar',
  notFoundTitle: 'Aquesta pàgina no existeix',
  notFoundBody: 'El joc que busques no hi és, o encara no s’ha publicat.',
  backHome: 'Tornar a l’inici',
  loading: 'Carregant…',
  errorTitle: 'Alguna cosa ha fallat',
  errorBody: 'Torna-ho a provar. Si continua, recarrega la pàgina.',
  retry: 'Tornar-ho a provar',
  langLabel: 'Idioma',
};

const es: PlatformCopy = {
  platformTitle: 'WildKeys Games',
  platformSubtitle: 'Minijuegos para aprender a identificar especies con claves dicotómicas.',
  gamesKicker: 'Juegos disponibles',
  play: 'Jugar',
  notFoundTitle: 'Esta página no existe',
  notFoundBody: 'El juego que buscas no está, o todavía no se ha publicado.',
  backHome: 'Volver al inicio',
  loading: 'Cargando…',
  errorTitle: 'Algo ha fallado',
  errorBody: 'Inténtalo de nuevo. Si sigue, recarga la página.',
  retry: 'Intentarlo de nuevo',
  langLabel: 'Idioma',
};

const en: PlatformCopy = {
  platformTitle: 'WildKeys Games',
  platformSubtitle: 'Mini games to learn how to identify species with dichotomous keys.',
  gamesKicker: 'Available games',
  play: 'Play',
  notFoundTitle: 'This page does not exist',
  notFoundBody: 'The game you are looking for is not here, or is not published yet.',
  backHome: 'Back to start',
  loading: 'Loading…',
  errorTitle: 'Something went wrong',
  errorBody: 'Try again. If it persists, reload the page.',
  retry: 'Try again',
  langLabel: 'Language',
};

export const platformBundle: I18nBundle<Locale, PlatformCopy> = {
  namespace: 'platform',
  fallbackLocale: FALLBACK_LOCALE,
  dictionaries: { ca, es, en },
};

export const { useT: usePlatformCopy } = createI18n(platformBundle, useLocale);
