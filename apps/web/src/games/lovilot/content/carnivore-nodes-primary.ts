import { toNode, toSpecies, type KeyOption } from '@wkg/game-engine';
import type { Locale } from '@/app/i18n/locale';

const text = (ca: string, es: string, en: string) => ({ ca, es, en });

/**
 * Pasos iniciales de la clave de carnívoros: del oso a la separación entre
 * cánidos de patas largas y el resto.
 */

/** Un paso de la clave antes de ensamblarla: el id lo pone `defineKey`. */
type NodeDraft = { title: Record<Locale, string>; options: readonly KeyOption<Locale>[] };

export const c1: NodeDraft = {
  title: text('Mida i cua', 'Tamaño y cola', 'Size and tail'),
  options: [
    {
      tag: '1a',
      to: toSpecies('ursus'),
      text: text(
        'Mida massiva (>80 kg), cua vestigial, camina recolzant tota la planta del peu (plantígrad).',
        'Tamaño masivo (>80 kg), cola vestigial, camina apoyando toda la planta del pie (plantígrado).',
        'Massive size (>80 kg), vestigial tail, walks on the whole sole of the foot (plantigrade).'
      ),
    },
    {
      tag: '1b',
      to: toNode('c2'),
      text: text(
        'Mida petita a gran (<80 kg), cua clarament visible (excepte en Lynx pardinus).',
        'Tamaño pequeño a grande (<80 kg), cola claramente visible (excepto en Lynx pardinus).',
        'Small to large size (<80 kg), tail clearly visible (except in Lynx pardinus).'
      ),
    },
  ],
};
export const c2: NodeDraft = {
  title: text('Adaptació al medi', 'Adaptación al medio', 'Habitat adaptation'),
  options: [
    {
      tag: '2a',
      to: toSpecies('lutra'),
      text: text(
        'Adaptació semiaquàtica: potes curtes i robustes amb membranes interdigitals (palmades); cua gruixuda i musculosa molt ampla a la base que s’estreny cap a la punta; pelatge vellutat molt dens, en mullar-se té un aspecte brillant, oliós.',
        'Adaptación semiacuática: patas cortas y robustas con membranas interdigitales (palmeadas); cola gruesa y musculosa muy ancha en la base que se va estrechando hacia la punta; pelaje aterciopelado muy denso, al mojarse tiene un aspecto brillante, aceitoso.',
        'Semi-aquatic adaptation: short, sturdy legs with webbed toes; thick, muscular tail, very broad at the base and tapering to the tip; very dense velvety fur that looks glossy and oily when wet.'
      ),
    },
    {
      tag: '2b',
      to: toNode('c3'),
      text: text(
        'Vida principalment terrestre: potes sense membranes interdigitals completes.',
        'Vida principalmente terrestre: patas sin membranas interdigitales completas.',
        'Mainly terrestrial life: feet without complete webbing.'
      ),
    },
  ],
};
export const c3: NodeDraft = {
  title: text('Orelles i cua', 'Orejas y cola', 'Ears and tail'),
  options: [
    {
      tag: '3a',
      to: toSpecies('lynx'),
      text: text(
        'Orelles amb pinzells de pèl negre a les puntes; cua molt curta (<25% del cos) amb punta negra.',
        'Orejas con pinceles de pelo negro en las puntas; cola muy corta (<25% del cuerpo) con punta negra.',
        'Ears with black hair tufts at the tips; very short tail (<25% of the body) with a black tip.'
      ),
    },
    {
      tag: '3b',
      to: toNode('c4'),
      text: text(
        'Orelles sense pinzells llargs; cua proporcional o llarga.',
        'Orejas sin pinceles largos; cola proporcional o larga.',
        'Ears without long tufts; tail proportionate or long.'
      ),
    },
  ],
};
export const c4: NodeDraft = {
  title: text('Patró de la cua', 'Patrón de la cola', 'Tail pattern'),
  options: [
    {
      tag: '4a',
      to: toNode('c5'),
      text: text(
        'Cua amb patró d’anells tancats o bandes fosques transversals.',
        'Cola con patrón de anillos cerrados o bandas oscuras transversales.',
        'Tail with closed rings or dark transverse bands.'
      ),
    },
    {
      tag: '4b',
      to: toNode('c8'),
      text: text(
        'Cua de color uniforme, o amb punta de color diferent, però sense anells ni bandes.',
        'Cola de color uniforme, o con punta de distinto color, pero sin anillos ni bandas.',
        'Tail of uniform colour, or with a differently coloured tip, but without rings or bands.'
      ),
    },
  ],
};
export const c5: NodeDraft = {
  title: text('Cara i cos', 'Cara y cuerpo', 'Face and body'),
  options: [
    {
      tag: '5a',
      to: toSpecies('procyon'),
      text: text(
        'Rostre amb màscara facial negra molt marcada; cua amb 5-7 anells negres complets que envolten tota la circumferència.',
        'Rostro con máscara facial (antifaz) negro muy marcado; cola con 5-7 anillos negros completos que rodean toda la circunferencia.',
        'Face with a strongly marked black mask; tail with 5-7 complete black rings encircling it.'
      ),
    },
    {
      tag: '5b',
      to: toSpecies('genetta'),
      text: text(
        'Rostre sense màscara ben definida; cos esvelt amb clapejat longitudinal, cua molt llarga amb anells negres definits sobre fons clar.',
        'Rostro sin máscara bien definida; cuerpo esbelto con moteado longitudinal, cola muy larga con anillos negros definidos sobre fondo claro.',
        'Face without a well-defined mask; slender body with longitudinal spotting, very long tail with defined black rings on a pale ground.'
      ),
    },
    {
      tag: '5c',
      to: toSpecies('felis'),
      text: text(
        'Rostre sense màscara facial; aspecte de gat, el pelatge presenta ratlles no punts. Cua ampla, arrodonida, sense banda dorsal, amb anells i punta terminal negra sòlida.',
        'Rostro sin máscara facial; aspecto de gato, el pelaje presenta rayas no puntos. Cola ancha, redondeada, sin banda dorsal, con anillos y punta terminal negra sólida.',
        'Face without a mask; cat-like, coat striped rather than spotted. Tail broad and rounded, no dorsal band, with rings and a solid black tip.'
      ),
    },
  ],
};
export const c8: NodeDraft = {
  title: text('Potes i complexió', 'Patas y complexión', 'Legs and build'),
  options: [
    {
      tag: '8a',
      to: toNode('c9'),
      text: text(
        'Potes llargues (alçada a l’espatlla >35 cm), camina recolzant només els dits (digitígrad), esvelt i àgil, morro allargat.',
        'Patas largas (alzada al hombro >35 cm), camina apoyando solo los dedos (digitígrado), esbelto y ágil, hocico alargado.',
        'Long legs (shoulder height >35 cm), walks on the toes only (digitigrade), slender and agile, elongated muzzle.'
      ),
    },
    {
      tag: '8b',
      to: toNode('c13'),
      text: text(
        'Potes curtes en relació al cos (alçada a l’espatlla <35 cm), cos cilíndric o massís, suport més pla.',
        'Patas cortas en relación al cuerpo (alzada al hombro <35 cm), cuerpo cilíndrico o macizo, apoyo más plano.',
        'Legs short relative to the body (shoulder height <35 cm), cylindrical or stocky body, flatter footfall.'
      ),
    },
  ],
};
export const c9: NodeDraft = {
  title: text('Complexió', 'Complexión', 'Build'),
  options: [
    {
      tag: '9a',
      to: toSpecies('canis'),
      text: text(
        'Complexió robusta, marques negres a la part anterior de les potes davanteres, cua amb punta negra.',
        'Complexión robusta, marcas negras en la parte anterior de las patas delanteras, cola con punta negra.',
        'Robust build, black markings on the front of the forelegs, tail with a black tip.'
      ),
    },
    {
      tag: '9b',
      to: toSpecies('vulpes'),
      text: text(
        'Complexió gràcil, orelles grans amb el dors negre, cua molt poblada sovint amb punta blanca.',
        'Complexión grácil, orejas grandes con el dorso negro, cola muy poblada frecuentemente con punta blanca.',
        'Slender build, large ears with black backs, very bushy tail often with a white tip.'
      ),
    },
  ],
};
