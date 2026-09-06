import { toNode, toSpecies, type KeyOption } from '@wkg/game-engine';
import type { Locale } from '@/app/i18n/locale';

const text = (ca: string, es: string, en: string) => ({ ca, es, en });

/**
 * Rama de patas cortas: mustélidos, tejón y meloncillo — donde se esconde la
 * marta (`martes`), el objetivo del reto extra.
 */

/** Un paso de la clave antes de ensamblarla: el id lo pone `defineKey`. */
type NodeDraft = { title: Record<Locale, string>; options: readonly KeyOption<Locale>[] };

export const c13: NodeDraft = {
  title: text('Cos i cara', 'Cuerpo y cara', 'Body and face'),
  options: [
    {
      tag: '13a',
      to: toSpecies('meles'),
      text: text(
        'Cos molt robust i massís, cap blanc amb màscara facial formant dues franges negres amples horitzontals que cobreixen els ulls i s’estenen fins al clatell.',
        'Cuerpo muy robusto y macizo, cabeza blanca con máscara facial formando dos franjas negras anchas horizontales que cubren los ojos y se extienden hasta la nuca.',
        'Very robust, stocky body, white head with a facial mask of two broad horizontal black bands over the eyes extending to the nape.'
      ),
    },
    {
      tag: '13b',
      to: toNode('c14'),
      text: text(
        'Cos més estilitzat, cilíndric o petit; sense franges negres amples a la cara.',
        'Cuerpo más estilizado, cilíndrico o pequeño; sin franjas negras anchas en la cara.',
        'More slender, cylindrical or small body; without broad black bands on the face.'
      ),
    },
  ],
};
export const c14: NodeDraft = {
  title: text('Mida i ventre', 'Tamaño y vientre', 'Size and belly'),
  options: [
    {
      tag: '14a',
      to: toSpecies('nivalis'),
      text: text(
        'Mida molt petita (longitud <25 cm), pelatge dorsal bru i ventral blanc pur amb la línia de separació molt recta i marcada.',
        'Tamaño muy pequeño (longitud <25 cm), pelaje dorsal pardo y ventral blanco puro con la línea de separación entre estas muy recta y marcada.',
        'Very small (length <25 cm), brown dorsal fur and pure white belly with a very straight, sharp dividing line.'
      ),
    },
    {
      tag: '14b',
      to: toNode('c15'),
      text: text(
        'Mida mitjana, pelatge ventral no blanc pur o amb taques específiques.',
        'Tamaño mediano, pelaje ventral no blanco puro o con manchas específicas.',
        'Medium size, belly fur not pure white or with specific patches.'
      ),
    },
  ],
};
export const c15: NodeDraft = {
  title: text('Pelatge i taca pectoral', 'Pelaje y mancha pectoral', 'Coat and chest patch'),
  options: [
    {
      tag: '15a',
      to: toSpecies('herpestes'),
      text: text(
        'Pelatge bru-grisós uniforme, cua molt llarga i ampla a la base (aspecte de mangosta), sense taca pectoral.',
        'Pelaje pardo-grisáceo uniforme, cola muy larga y ancha en la base (aspecto de mangosta), sin mancha pectoral.',
        'Uniform greyish-brown coat, very long tail broad at the base (mongoose-like), no chest patch.'
      ),
    },
    {
      tag: '15b',
      to: toNode('c16'),
      text: text(
        'Presència de taca pectoral (pitrera) blanca o groguenca ben definida.',
        'Presencia de mancha pectoral (babero) blanca o amarillenta bien definida.',
        'A well-defined white or yellowish chest patch (bib) is present.'
      ),
    },
    {
      tag: '15c',
      to: toNode('c17'),
      text: text(
        'Sense taca pectoral definida; pelatge fosc uniforme o amb disseny facial.',
        'Sin mancha pectoral definida; pelaje oscuro uniforme o con diseño facial.',
        'No defined chest patch; uniformly dark coat or with a facial pattern.'
      ),
    },
  ],
};
export const c16: NodeDraft = {
  title: text(
    'Color de la taca pectoral',
    'Color de la mancha pectoral',
    'Colour of the chest patch'
  ),
  options: [
    {
      tag: '16a',
      to: toSpecies('foina'),
      text: text(
        'Taca pectoral blanca o blanc-crema, generalment ben definida i amb tendència a prolongar-se i bifurcar-se cap a la cara interna de les potes davanteres, formant dues prolongacions visibles.',
        'Mancha pectoral (babero) blanca o blanco-crema, generalmente bien definida y con tendencia a prolongarse y bifurcarse hacia la cara interna de las patas delanteras, formando dos prolongaciones visibles.',
        'Chest patch white or cream-white, usually well defined and tending to extend and fork towards the inner side of the forelegs, forming two visible extensions.'
      ),
    },
    {
      tag: '16b',
      to: toSpecies('martes'),
      text: text(
        'Taca pectoral groguenca, crema-groga o ataronjada, habitualment més compacta i sense una bifurcació tan marcada cap a les potes davanteres; pot presentar contorns irregulars o aparèixer parcialment fragmentada en taques.',
        'Mancha pectoral amarillenta, crema-amarilla o anaranjada, habitualmente más compacta y sin una bifurcación tan marcada hacia las patas delanteras; puede presentar contornos irregulares o aparecer parcialmente fragmentada en manchas.',
        'Chest patch yellowish, cream-yellow or orange, usually more compact and without such a marked fork towards the forelegs; may have irregular outlines or appear partly broken into patches.'
      ),
    },
  ],
};
export const c17: NodeDraft = {
  title: text('Llavis i cara', 'Labios y cara', 'Lips and face'),
  options: [
    {
      tag: '17a',
      to: toSpecies('lutreola'),
      text: text(
        'Taca blanca present al llavi superior i inferior.',
        'Mancha blanca presente en el labio superior e inferior.',
        'White patch present on both upper and lower lip.'
      ),
    },
    {
      tag: '17b',
      to: toSpecies('vison'),
      text: text(
        'Taca blanca present només al llavi inferior (barbeta) o absent.',
        'Mancha blanca presente solo en el labio inferior (barbilla) o ausente.',
        'White patch only on the lower lip (chin) or absent.'
      ),
    },
    {
      tag: '17c',
      to: toSpecies('putorius'),
      text: text(
        'Rostre amb disseny d’antifaç fosc, cos amb flancs més clars que el llom. La forma domèstica és el fura (Mustela furo).',
        'Rostro con diseño de antifaz oscuro, cuerpo con flancos más claros que el lomo. La forma doméstica es el hurón (Mustela furo).',
        'Face with a dark mask pattern, flanks paler than the back. The domestic form is the ferret (Mustela furo).'
      ),
    },
  ],
};
