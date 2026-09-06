import { describe, expect, it } from 'vitest';
import { compileKey } from '../compile.js';
import { KeyValidationError, validateKey } from '../validate.js';
import { toNode, toSpecies } from '../authoring.js';
import { keyWith, validKey } from './fixtures.js';

describe('compileKey', () => {
  const compiled = compileKey(validKey);

  it('deriva el camino correcto hasta la especie objetivo', () => {
    expect(compiled.correctPath).toEqual(['n1', 'n2']);
    expect(compiled.correctOptionByNode.get('n1')).toBe(0);
    expect(compiled.correctOptionByNode.get('n2')).toBe(0);
  });

  it('calcula las especies alcanzables por nodo respetando displayOrder', () => {
    expect(compiled.reachableSpeciesByNode.get('n1')).toEqual(['alfa', 'beta', 'gamma']);
    expect(compiled.reachableSpeciesByNode.get('n2')).toEqual(['alfa', 'beta']);
  });

  it('extrae el número de paso de las etiquetas', () => {
    expect(compiled.stepLabelByNode.get('n1')).toBe('1');
    expect(compiled.stepLabelByNode.get('n2')).toBe('2');
  });
});

describe('validateKey', () => {
  it('acepta una clave coherente', () => {
    expect(validateKey(validKey)).toEqual([]);
  });

  it('detecta referencias rotas', () => {
    const broken = keyWith({
      nodes: {
        ...validKey.nodes,
        n1: {
          id: 'n1',
          title: { es: 'x', en: 'x' },
          options: [
            { tag: '1a', to: toNode('inexistente'), text: { es: 'a', en: 'a' } },
            { tag: '1b', to: toSpecies('fantasma'), text: { es: 'b', en: 'b' } },
          ],
        },
      },
    });
    expect(validateKey(broken)).toHaveLength(2);
  });

  it('detecta ciclos', () => {
    const cyclic = keyWith({
      nodes: {
        ...validKey.nodes,
        n2: {
          id: 'n2',
          title: { es: 'x', en: 'x' },
          options: [
            { tag: '2a', to: toNode('n1'), text: { es: 'a', en: 'a' } },
            { tag: '2b', to: toSpecies('beta'), text: { es: 'b', en: 'b' } },
          ],
        },
      },
    });
    expect(validateKey(cyclic).join(' ')).toContain('Ciclo');
  });

  it('detecta un objetivo alcanzable por más de una ruta', () => {
    const ambiguous = keyWith({
      nodes: {
        ...validKey.nodes,
        n2: {
          id: 'n2',
          title: { es: 'x', en: 'x' },
          options: [
            { tag: '2a', to: toSpecies('alfa'), text: { es: 'a', en: 'a' } },
            { tag: '2b', to: toSpecies('alfa'), text: { es: 'b', en: 'b' } },
          ],
        },
      },
    });
    const issues = validateKey(ambiguous).join(' ');
    expect(issues).toContain('2 rutas');
  });

  it('detecta especies inalcanzables', () => {
    const orphan = keyWith({
      species: {
        ...validKey.species,
        delta: { id: 'delta', scientificName: 'Genus delta', name: { es: 'D', en: 'D' } },
      },
      displayOrder: ['alfa', 'beta', 'gamma', 'delta'],
    });
    expect(validateKey(orphan).join(' ')).toContain('inalcanzable');
  });

  it('compileKey lanza KeyValidationError con el detalle', () => {
    const broken = keyWith({ rootNodeId: 'no-existe' });
    expect(() => compileKey(broken)).toThrow(KeyValidationError);
  });
});
