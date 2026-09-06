import { describe, expect, it } from 'vitest';
import { createTranslate, interpolate, localesOf, resolveInitialLocale } from '../translator.js';
import type { I18nBundle } from '../types.js';

interface TestDict extends Record<string, string> {
  hello: string;
  left: string;
}

const ca: TestDict = { hello: 'Hola', left: 'En queden {n} de {total}' };
const bundle: I18nBundle<'ca' | 'en', TestDict> = {
  namespace: 'test',
  fallbackLocale: 'ca',
  dictionaries: {
    ca,
    en: { hello: 'Hello', left: '{n} of {total} left' },
  },
};

describe('interpolate', () => {
  it('sustituye los marcadores presentes', () => {
    expect(interpolate('En queden {n} de {total}', { n: 3, total: 6 })).toBe('En queden 3 de 6');
  });

  it('deja intacto un marcador sin valor', () => {
    expect(interpolate('Quedan {n}', {})).toBe('Quedan {n}');
  });
});

describe('createTranslate', () => {
  it('traduce al locale pedido', () => {
    expect(createTranslate(bundle, 'en')('hello')).toBe('Hello');
  });

  it('cae al locale de reserva si falta la clave', () => {
    const partial: I18nBundle<'ca' | 'en', TestDict> = {
      ...bundle,
      dictionaries: { ca, en: { hello: 'Hello' } as TestDict },
    };
    expect(createTranslate(partial, 'en')('left', { n: 1, total: 6 })).toBe('En queden 1 de 6');
  });

  it('devuelve la clave si no está en ningún locale', () => {
    expect(createTranslate(bundle, 'en')('missing' as 'hello')).toBe('missing');
  });
});

describe('resolveInitialLocale', () => {
  const supported = ['ca', 'es', 'en'] as const;

  it('prioriza el locale guardado', () => {
    expect(
      resolveInitialLocale({ supported, fallback: 'ca', stored: 'en', preferred: ['es-ES'] })
    ).toBe('en');
  });

  it('usa el idioma del navegador ignorando la región', () => {
    expect(
      resolveInitialLocale({ supported, fallback: 'ca', stored: null, preferred: ['es-ES'] })
    ).toBe('es');
  });

  it('cae a la reserva si nada encaja', () => {
    expect(
      resolveInitialLocale({ supported, fallback: 'ca', stored: 'de', preferred: ['fr-FR'] })
    ).toBe('ca');
  });
});

describe('localesOf', () => {
  it('lista los locales del bundle', () => {
    expect(localesOf(bundle)).toEqual(['ca', 'en']);
  });
});
