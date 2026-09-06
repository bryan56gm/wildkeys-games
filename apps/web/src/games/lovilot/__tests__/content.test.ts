import { describe, expect, it } from 'vitest';
import { compileKey, targetSpecies } from '@wkg/game-engine';
import { localesOf } from '@wkg/i18n';
import { validateGameDefinition, type AnyGameDefinition } from '@/features/dichotomous-game';
import { SUPPORTED_LOCALES } from '@/app/i18n/locale';
import { lovilotGame } from '..';
import { ca } from '../i18n/ca';

/**
 * El contenido del juego es dato, y como tal se verifica: una clave rota o un
 * texto sin traducir tienen que fallar aquí, no en el móvil de un asistente al
 * evento.
 */
describe('definición del juego LO VILOT', () => {
  it('pasa la validación completa', () => {
    // Igual que en el catálogo, el juego se comprueba con su forma genérica
    // (ver `registerGame` en games/registry.ts).
    expect(validateGameDefinition(lovilotGame as unknown as AnyGameDefinition)).toEqual([]);
  });

  it('declara los tres idiomas de la plataforma', () => {
    expect([...localesOf(lovilotGame.i18n)].sort()).toEqual([...SUPPORTED_LOCALES].sort());
  });

  it('traduce todas las claves en todos los idiomas', () => {
    const expected = Object.keys(ca);

    for (const locale of localesOf(lovilotGame.i18n)) {
      const dictionary = lovilotGame.i18n.dictionaries[locale] as unknown as Record<string, string>;
      const missing = expected.filter((key) => !dictionary[key]?.trim());
      expect({ locale, missing }).toEqual({ locale, missing: [] });
    }
  });
});

describe('clave del lúpulo', () => {
  const compiled = compileKey(lovilotGame.challenges[0]!.key);

  it('lleva a la variedad Vista en tres pasos', () => {
    expect(compiled.correctPath).toEqual(['h1', 'h4', 'h5']);
    expect(targetSpecies(compiled).id).toBe('vista');
  });

  it('pone en juego las seis variedades desde la raíz', () => {
    expect(compiled.reachableSpeciesByNode.get('h1')).toHaveLength(6);
  });
});

describe('clave de carnívoros', () => {
  const compiled = compileKey(lovilotGame.challenges[1]!.key);

  it('lleva a la marta por el recorrido documentado', () => {
    expect(compiled.correctPath).toEqual([
      'c1',
      'c2',
      'c3',
      'c4',
      'c8',
      'c13',
      'c14',
      'c15',
      'c16',
    ]);
    expect(targetSpecies(compiled).scientificName).toBe('Martes martes');
  });

  it('pone en juego las dieciséis especies desde la raíz', () => {
    expect(compiled.reachableSpeciesByNode.get('c1')).toHaveLength(16);
  });

  it('descarta el oso en cuanto se elige la rama de tamaño menor', () => {
    expect(compiled.reachableSpeciesByNode.get('c2')).not.toContain('ursus');
  });
});
