import { defineKey, toNode, toSpecies } from '../authoring.js';
import type { DichotomousKey } from '../types.js';

export type TestLocale = 'es' | 'en';

const text = (es: string, en: string) => ({ es, en });

/**
 * Clave mínima de prueba:
 *
 * ```
 * n1 ─1a→ n2 ─2a→ alfa (objetivo)
 *  │        └─2b→ beta
 *  └─1b→ gamma
 * ```
 */
export const validKey: DichotomousKey<TestLocale> = defineKey<TestLocale>({
  id: 'test',
  rootNodeId: 'n1',
  targetSpeciesId: 'alfa',
  displayOrder: ['alfa', 'beta', 'gamma'],
  species: {
    alfa: { scientificName: 'Genus alfa', name: text('Alfa', 'Alpha') },
    beta: { scientificName: 'Genus beta', name: text('Beta', 'Beta') },
    gamma: { scientificName: 'Genus gamma', name: text('Gamma', 'Gamma') },
  },
  nodes: {
    n1: {
      title: text('Primer carácter', 'First character'),
      options: [
        { tag: '1a', to: toNode('n2'), text: text('Con pelo', 'Hairy') },
        { tag: '1b', to: toSpecies('gamma'), text: text('Sin pelo', 'Hairless') },
      ],
    },
    n2: {
      title: text('Segundo carácter', 'Second character'),
      options: [
        { tag: '2a', to: toSpecies('alfa'), text: text('Cola larga', 'Long tail') },
        { tag: '2b', to: toSpecies('beta'), text: text('Cola corta', 'Short tail') },
      ],
    },
  },
});

/** Igual que {@link validKey} pero con la mutación que pida cada test. */
export function keyWith(patch: Partial<DichotomousKey<TestLocale>>): DichotomousKey<TestLocale> {
  return { ...validKey, ...patch };
}
