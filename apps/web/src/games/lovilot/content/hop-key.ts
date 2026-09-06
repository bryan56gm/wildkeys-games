import { defineKey, toNode, toSpecies, type DichotomousKey } from '@wkg/game-engine';
import type { Locale } from '@/app/i18n/locale';

const text = (ca: string, es: string, en: string) => ({ ca, es, en });

const variety = (name: string) => ({
  scientificName: `Humulus lupulus var. ${name}`,
  name: text(name, name, name),
});

/**
 * Clave dicotómica de las variedades de lúpulo cultivadas en LO VILOT.
 * Objetivo: `vista`. Fuente: Esther Martínez Pujol, 2026, WildKeys.
 *
 * El camino correcto (1b → 4a → 5a) lo deriva el motor del propio árbol; no se
 * declara aquí para que no pueda quedar desincronizado del contenido.
 */
export const hopKey: DichotomousKey<Locale> = defineKey<Locale>({
  id: 'lovilot.hop',
  rootNodeId: 'h1',
  targetSpeciesId: 'vista',
  displayOrder: ['chinook', 'cascade', 'cashmere', 'comet', 'vista', 'rakau'],
  species: {
    chinook: variety('Chinook'),
    cascade: variety('Cascade'),
    cashmere: variety('Cashmere'),
    comet: variety('Comet'),
    vista: variety('Vista'),
    rakau: variety('Rakau'),
  },
  nodes: {
    h1: {
      title: text('Forma de la flor', 'Forma de la flor', 'Flower shape'),
      options: [
        {
          tag: '1a',
          to: toNode('h2'),
          text: text(
            'Flors més aviat rodones o amb forma de prisma.',
            'Flores más bien redondas o con forma de prisma.',
            'Flowers rather round or prism-shaped.'
          ),
        },
        {
          tag: '1b',
          to: toNode('h4'),
          text: text(
            'Flors clarament allargades.',
            'Flores claramente alargadas.',
            'Flowers clearly elongated.'
          ),
        },
      ],
    },
    h2: {
      title: text('Forma detallada', 'Forma detallada', 'Detailed shape'),
      options: [
        {
          tag: '2a',
          to: toNode('h3'),
          text: text(
            'Flors amb forma de prisma, prim a la punta i s’eixampla cap a la base.',
            'Flores con forma de prisma, estrechas en la punta y que se ensanchan hacia la base.',
            'Flowers prism-shaped, narrow at the tip and widening towards the base.'
          ),
        },
        {
          tag: '2b',
          to: toSpecies('cashmere'),
          text: text(
            'Flors amb forma arrodonida.',
            'Flores de forma redondeada.',
            'Flowers rounded in shape.'
          ),
        },
      ],
    },
    h3: {
      title: text('Densitat de la flor', 'Densidad de la flor', 'Flower density'),
      options: [
        {
          tag: '3a',
          to: toSpecies('cascade'),
          text: text(
            'Flors poc denses i amb bràctees bastant obertes.',
            'Flores poco densas y con brácteas bastante abiertas.',
            'Flowers loosely packed, with fairly open bracts.'
          ),
        },
        {
          tag: '3b',
          to: toSpecies('chinook'),
          text: text(
            'Flors bastant compactes amb bràctees majoritàriament tancades.',
            'Flores bastante compactas con brácteas mayoritariamente cerradas.',
            'Flowers fairly compact, with mostly closed bracts.'
          ),
        },
      ],
    },
    h4: {
      title: text('Època de collita', 'Época de cosecha', 'Harvest time'),
      options: [
        {
          tag: '4a',
          to: toNode('h5'),
          text: text(
            'Es cull fins a finals de setembre.',
            'Se cosecha hasta finales de septiembre.',
            'Harvested until the end of September.'
          ),
        },
        {
          tag: '4b',
          to: toSpecies('comet'),
          text: text(
            'Es cull màxim fins la primera quinzena de setembre.',
            'Se cosecha como máximo hasta la primera quincena de septiembre.',
            'Harvested at most until the first half of September.'
          ),
        },
      ],
    },
    h5: {
      title: text(
        'Bràctees en el moment de la collita',
        'Brácteas en el momento de la cosecha',
        'Bracts at harvest time'
      ),
      options: [
        {
          tag: '5a',
          to: toSpecies('vista'),
          text: text(
            'Flor amb bràctees majoritàriament obertes en el moment de la collita.',
            'Flor con brácteas mayoritariamente abiertas en el momento de la cosecha.',
            'Flower with bracts mostly open at harvest time.'
          ),
        },
        {
          tag: '5b',
          to: toSpecies('rakau'),
          text: text(
            'Flor amb bràctees majoritàriament compactes/tancades en el moment de la collita.',
            'Flor con brácteas mayoritariamente compactas/cerradas en el momento de la cosecha.',
            'Flower with bracts mostly compact/closed at harvest time.'
          ),
        },
      ],
    },
  },
});
