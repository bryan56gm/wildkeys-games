import type { DictionaryShape, I18nBundle, Translate, TranslationParams } from './types.js';

const PLACEHOLDER = /\{(\w+)\}/gu;

/**
 * Sustituye `{marcadores}` por sus valores. Un marcador sin valor se deja tal
 * cual: en pantalla se ve el hueco y el fallo se detecta, en lugar de quedar
 * un texto mudo.
 */
export function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * Construye la función de traducción de un bundle para un locale. Si falta la
 * clave en ese locale se cae al locale de reserva, y en último término se
 * devuelve la propia clave (visible en QA, nunca una cadena vacía).
 */
export function createTranslate<L extends string, TDict extends DictionaryShape>(
  bundle: I18nBundle<L, TDict>,
  locale: L
): Translate<TDict> {
  // Los diccionarios son planos por contrato (ver `DictionaryShape`); este es
  // el único punto donde hace falta decírselo a TypeScript.
  const primary = bundle.dictionaries[locale] as
    Readonly<Record<string, string | undefined>> | undefined;
  const fallback = bundle.dictionaries[bundle.fallbackLocale] as
    Readonly<Record<string, string | undefined>> | undefined;

  return (key, params) => interpolate(primary?.[key] ?? fallback?.[key] ?? key, params);
}

/** Locales declarados por un bundle, sea cual sea la forma de sus diccionarios. */
export function localesOf<L extends string>(bundle: {
  dictionaries: Readonly<Record<L, unknown>>;
}): readonly L[] {
  return Object.keys(bundle.dictionaries) as L[];
}

/**
 * Elige el locale inicial: el guardado por el usuario, si no el preferido del
 * navegador (comparando solo el idioma, `es-ES` → `es`), si no la reserva.
 */
export function resolveInitialLocale<L extends string>(options: {
  supported: readonly L[];
  fallback: L;
  stored?: string | null;
  preferred?: readonly string[];
}): L {
  const supported = new Set<string>(options.supported);

  if (options.stored && supported.has(options.stored)) return options.stored as L;

  for (const tag of options.preferred ?? []) {
    const language = tag.toLowerCase().split('-')[0];
    if (language && supported.has(language)) return language as L;
  }
  return options.fallback;
}
