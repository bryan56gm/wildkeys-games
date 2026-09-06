/**
 * Capa de internacionalización de la plataforma: un locale activo compartido y
 * un diccionario tipado por juego.
 */
export * from './types.js';
export { createTranslate, interpolate, localesOf, resolveInitialLocale } from './translator.js';
export {
  createLocaleContext,
  type LocaleContextValue,
  type LocalePersistence,
} from './react/locale-context.js';
export { createI18n } from './react/create-i18n.js';
