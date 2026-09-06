import { createLocaleContext } from '@wkg/i18n';
import { createSafeStorage } from '@/lib/storage/safe-storage';

/** Idiomas de la plataforma. Añadir uno aquí obliga a completarlo en todos
 *  los diccionarios: TypeScript no deja publicar un locale a medias. */
export const SUPPORTED_LOCALES = ['ca', 'es', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Catalán por defecto: el primer evento es en Lleida. */
export const FALLBACK_LOCALE: Locale = 'ca';

const LOCALE_STORAGE_KEY = 'wk.locale';
const storage = createSafeStorage('local');

export const { LocaleProvider, useLocale } = createLocaleContext<Locale>({
  supported: SUPPORTED_LOCALES,
  fallback: FALLBACK_LOCALE,
  persistence: {
    read: () => storage.read(LOCALE_STORAGE_KEY),
    write: (locale) => storage.write(LOCALE_STORAGE_KEY, locale),
  },
});
