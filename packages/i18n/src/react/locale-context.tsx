import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { resolveInitialLocale } from '../translator.js';

/** Lectura/escritura del locale elegido. La inyecta la app: el paquete no
 *  asume `localStorage` (ni que exista `window`). */
export interface LocalePersistence {
  read(): string | null;
  write(locale: string): void;
}

export interface LocaleContextValue<L extends string> {
  readonly locale: L;
  readonly supported: readonly L[];
  setLocale(locale: L): void;
}

/**
 * Crea el contexto de idioma **compartido por toda la app**: un solo locale
 * activo, muchos diccionarios (uno por juego). Devuelve un provider y un hook
 * ya tipados con los locales reales, sin castings en el sitio de uso.
 */
export function createLocaleContext<L extends string>(config: {
  supported: readonly L[];
  fallback: L;
  persistence?: LocalePersistence;
}) {
  const Context = createContext<LocaleContextValue<L> | null>(null);
  Context.displayName = 'LocaleContext';

  function LocaleProvider({ children, initial }: { children: ReactNode; initial?: L }): ReactNode {
    const [locale, setLocaleState] = useState<L>(
      () =>
        initial ??
        resolveInitialLocale({
          supported: config.supported,
          fallback: config.fallback,
          stored: config.persistence?.read() ?? null,
          preferred: typeof navigator === 'undefined' ? [] : navigator.languages,
        })
    );

    const setLocale = useCallback((next: L) => {
      setLocaleState(next);
      config.persistence?.write(next);
      if (typeof document !== 'undefined') document.documentElement.lang = next;
    }, []);

    const value = useMemo<LocaleContextValue<L>>(
      () => ({ locale, supported: config.supported, setLocale }),
      [locale, setLocale]
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useLocale(): LocaleContextValue<L> {
    const value = useContext(Context);
    if (!value)
      throw new Error('useLocale() requiere que el árbol esté dentro de <LocaleProvider>.');
    return value;
  }

  return { LocaleProvider, useLocale };
}
