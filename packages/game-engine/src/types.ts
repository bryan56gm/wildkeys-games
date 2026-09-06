/**
 * Tipos del dominio "clave dicotómica".
 *
 * El motor es agnóstico del contenido y del idioma: solo sabe que los textos
 * son un mapa `locale -> string`. Quién define esos locales es la app, no el
 * motor, de ahí el parámetro genérico `L`.
 */

/** Id de un nodo de decisión dentro de una clave (p. ej. `'h1'`). */
export type NodeId = string;

/** Id estable de una especie/variedad (p. ej. `'vista'`). */
export type SpeciesId = string;

/** Texto traducido a cada locale soportado por el juego. */
export type LocalizedText<L extends string = string> = Readonly<Record<L, string>>;

/** Destino de una opción: otro nodo de decisión, o una especie terminal. */
export type OptionTarget =
  | { readonly kind: 'node'; readonly nodeId: NodeId }
  | { readonly kind: 'species'; readonly speciesId: SpeciesId };

/** Una de las 2-3 ramas que salen de un nodo. */
export interface KeyOption<L extends string = string> {
  /** Etiqueta corta de la rama tal y como se imprime en las claves: `'4a'`. */
  readonly tag: string;
  /** Descripción larga del carácter diagnóstico de esta rama. */
  readonly text: LocalizedText<L>;
  readonly to: OptionTarget;
}

/** Un paso de la clave: un carácter a observar y sus ramas. */
export interface KeyNode<L extends string = string> {
  readonly id: NodeId;
  /** Título corto del carácter observado ("Forma de la flor"). */
  readonly title: LocalizedText<L>;
  readonly options: readonly KeyOption<L>[];
}

/** Especie o variedad a la que puede llegar la clave. */
export interface KeySpecies<L extends string = string> {
  readonly id: SpeciesId;
  /** Nombre científico, se muestra siempre en cursiva y sin traducir. */
  readonly scientificName: string;
  /** Nombre vernáculo por locale. */
  readonly name: LocalizedText<L>;
}

/**
 * Dataset completo de una clave. Es dato puro y serializable: cualquier juego
 * futuro aporta el suyo y reutiliza el motor sin tocar código.
 */
export interface DichotomousKey<L extends string = string> {
  readonly id: string;
  readonly rootNodeId: NodeId;
  /** Especie que el jugador debe alcanzar para ganar. */
  readonly targetSpeciesId: SpeciesId;
  readonly nodes: Readonly<Record<NodeId, KeyNode<L>>>;
  readonly species: Readonly<Record<SpeciesId, KeySpecies<L>>>;
  /** Orden en que se pintan las especies en la rejilla de "aún en juego". */
  readonly displayOrder: readonly SpeciesId[];
}

/** Un paso ya tomado por el jugador. */
export interface TrailStep {
  readonly nodeId: NodeId;
  readonly optionIndex: number;
  readonly tag: string;
}

/** Estado del recorrido de una clave. No incluye tiempo ni puntuación. */
export type RunStatus = 'playing' | 'failed' | 'won';

export interface RunState {
  readonly status: RunStatus;
  /** Nodo en el que está (o al que volverá tras descartar el fallo). */
  readonly nodeId: NodeId;
  readonly trail: readonly TrailStep[];
  /** Número de veces que ha llegado a una especie equivocada. */
  readonly fails: number;
  /** Especie errónea alcanzada en el último fallo; solo con `status: 'failed'`. */
  readonly wrongSpeciesId: SpeciesId | null;
}

/** Eventos que hacen avanzar la máquina de estados. */
export type RunEvent =
  | { readonly type: 'PICK'; readonly optionIndex: number }
  | { readonly type: 'UNDO' }
  | { readonly type: 'DISMISS_FAILURE' }
  | { readonly type: 'RESTART' };
