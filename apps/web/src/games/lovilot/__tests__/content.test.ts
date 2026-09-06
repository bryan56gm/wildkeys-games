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

  /**
   * La estructura, rama a rama, tal y como la firmó Esther. Está escrita aquí
   * para que tocar la clave sin querer salte en los tests: es contenido
   * científico, no una preferencia de diseño.
   */
  it('respeta la clave publicada, rama a rama', () => {
    const destino = (nodeId: string, tag: string) => {
      const option = compiled.key.nodes[nodeId]?.options.find((item) => item.tag === tag);
      if (!option) return `${tag}: NO EXISTE`;
      return option.to.kind === 'node' ? option.to.nodeId : option.to.speciesId;
    };

    expect({
      '1a': destino('h1', '1a'),
      '1b': destino('h1', '1b'),
      '2a': destino('h2', '2a'),
      '2b': destino('h2', '2b'),
      '3a': destino('h3', '3a'),
      '3b': destino('h3', '3b'),
      '4a': destino('h4', '4a'),
      '4b': destino('h4', '4b'),
      '5a': destino('h5', '5a'),
      '5b': destino('h5', '5b'),
    }).toEqual({
      '1a': 'h2',
      '1b': 'h4',
      '2a': 'h3',
      '2b': 'cashmere',
      '3a': 'cascade',
      '3b': 'chinook',
      '4a': 'h5',
      '4b': 'comet',
      '5a': 'vista',
      '5b': 'raku',
    });
  });

  it('no deja ninguna rama con texto pendiente', () => {
    const pendientes: string[] = [];
    for (const node of Object.values(compiled.key.nodes)) {
      for (const option of node.options) {
        for (const [locale, value] of Object.entries(option.text)) {
          if (/pendent|pendiente|pending/i.test(value))
            pendientes.push(`${option.tag} (${locale})`);
        }
      }
    }
    expect(pendientes).toEqual([]);
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
