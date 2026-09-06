import { useMemo } from 'react';
import { createTranslate } from '../translator.js';
import type { DictionaryShape, I18nBundle, Translate } from '../types.js';

/**
 * Une un bundle de diccionarios con el locale activo de la app.
 *
 * Cada juego llama a esto con sus propios textos, así las claves quedan
 * aisladas por juego y `t()` autocompleta solo las suyas.
 *
 * ```ts
 * const { useT } = createI18n(lovilotBundle, useLocale);
 * const t = useT();  // t('winTitle') tipado contra el diccionario del juego
 * ```
 */
export function createI18n<L extends string, TDict extends DictionaryShape>(
  bundle: I18nBundle<L, TDict>,
  useLocale: () => { readonly locale: L }
) {
  function useT(): Translate<TDict> {
    const { locale } = useLocale();
    return useMemo(() => createTranslate(bundle, locale), [locale]);
  }

  return { useT, bundle };
}
