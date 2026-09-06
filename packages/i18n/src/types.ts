/** Diccionario plano `clave -> texto`. Las claves son el contrato de la copy. */
export type Dictionary = Readonly<Record<string, string>>;

/**
 * Restricción con la que se parametrizan bundles y traductores.
 *
 * No es `Dictionary` a propósito: un diccionario cuyas claves se generan con
 * plantillas (`` `${reto}.winTitle` ``) no obtiene firma de índice y no
 * satisfaría `Record<string, string>`, aunque en la práctica sea exactamente
 * eso. Los valores siguen siendo cadenas por contrato.
 */
export type DictionaryShape = object;

/** Valores admitidos al interpolar `{marcadores}` en un texto. */
export type TranslationParams = Readonly<Record<string, string | number>>;

/**
 * Diccionarios de un espacio de nombres (la plataforma, o un juego concreto).
 *
 * `TDict` se toma del diccionario de referencia, de modo que TypeScript exige
 * a los demás locales exactamente las mismas claves y `t()` solo acepta claves
 * que existen de verdad.
 */
export interface I18nBundle<L extends string, TDict extends DictionaryShape> {
  readonly namespace: string;
  readonly fallbackLocale: L;
  readonly dictionaries: Readonly<Record<L, TDict>>;
}

/** Función de traducción tipada contra las claves del diccionario. */
export type Translate<TDict extends DictionaryShape> = (
  key: keyof TDict & string,
  params?: TranslationParams
) => string;
