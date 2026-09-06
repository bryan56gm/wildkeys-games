import type { LocalizedText } from '@wkg/game-engine';
import type { Locale } from '@/app/i18n/locale';

const text = (ca: string, es: string, en: string): LocalizedText<Locale> => ({ ca, es, en });

/**
 * Los 16 carnívoros terrestres de España que entran en la clave.
 * Fuente: `docs/game/reference/assets/clave-carnivoros.pdf`.
 */
export const carnivoreSpecies = {
  ursus: { scientificName: 'Ursus arctos', name: text('Ós bru', 'Oso pardo', 'Brown bear') },
  lutra: { scientificName: 'Lutra lutra', name: text('Llúdriga', 'Nutria', 'Otter') },
  lynx: {
    scientificName: 'Lynx pardinus',
    name: text('Linx ibèric', 'Lince ibérico', 'Iberian lynx'),
  },
  procyon: { scientificName: 'Procyon lotor', name: text('Rentador', 'Mapache', 'Raccoon') },
  genetta: { scientificName: 'Genetta genetta', name: text('Geneta', 'Gineta', 'Common genet') },
  felis: {
    scientificName: 'Felis silvestris',
    name: text('Gat salvatge', 'Gato montés', 'Wildcat'),
  },
  canis: {
    scientificName: 'Canis lupus signatus',
    name: text('Llop ibèric', 'Lobo ibérico', 'Iberian wolf'),
  },
  vulpes: { scientificName: 'Vulpes vulpes', name: text('Guineu', 'Zorro', 'Red fox') },
  meles: { scientificName: 'Meles meles', name: text('Teixó', 'Tejón', 'Badger') },
  nivalis: {
    scientificName: 'Mustela nivalis',
    name: text('Mostela', 'Comadreja', 'Least weasel'),
  },
  herpestes: {
    scientificName: 'Herpestes ichneumon',
    name: text('Mangosta', 'Meloncillo', 'Egyptian mongoose'),
  },
  foina: { scientificName: 'Martes foina', name: text('Fagina', 'Garduña', 'Beech marten') },
  martes: { scientificName: 'Martes martes', name: text('Marta', 'Marta', 'Pine marten') },
  lutreola: {
    scientificName: 'Mustela lutreola',
    name: text('Visó europeu', 'Visón europeo', 'European mink'),
  },
  vison: {
    scientificName: 'Neogale vison',
    name: text('Visó americà', 'Visón americano', 'American mink'),
  },
  putorius: { scientificName: 'Mustela putorius', name: text('Turó', 'Turón', 'European polecat') },
} as const;

/** Orden en que se pintan en la rejilla de "especies en juego". */
export const carnivoreDisplayOrder = [
  'ursus',
  'lutra',
  'lynx',
  'procyon',
  'genetta',
  'felis',
  'canis',
  'vulpes',
  'meles',
  'nivalis',
  'herpestes',
  'foina',
  'martes',
  'lutreola',
  'vison',
  'putorius',
] as const;
