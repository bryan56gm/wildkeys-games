import { defineKey, type DichotomousKey } from '@wkg/game-engine';
import type { Locale } from '@/app/i18n/locale';
import { carnivoreDisplayOrder, carnivoreSpecies } from './carnivore-species';
import { c13, c14, c15, c16, c17 } from './carnivore-nodes-mustelids';
import { c1, c2, c3, c4, c5, c8, c9 } from './carnivore-nodes-primary';

/**
 * Clave dicotómica de los 16 carnívoros terrestres de España — el reto extra
 * que se ofrece tras identificar el lúpulo. Objetivo: `martes`.
 *
 * Los pasos van en ficheros aparte por volumen de texto; aquí solo se
 * ensamblan. El camino correcto lo deriva el motor del propio árbol.
 */
export const carnivoreKey: DichotomousKey<Locale> = defineKey<Locale>({
  id: 'lovilot.carn',
  rootNodeId: 'c1',
  targetSpeciesId: 'martes',
  displayOrder: [...carnivoreDisplayOrder],
  species: carnivoreSpecies,
  nodes: { c1, c2, c3, c4, c5, c8, c9, c13, c14, c15, c16, c17 },
});
