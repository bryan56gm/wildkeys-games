import { getNode, getOption, type CompiledKey } from './compile.js';
import type {
  KeyNode,
  KeyOption,
  KeySpecies,
  LocalizedText,
  NodeId,
  RunState,
  SpeciesId,
  TrailStep,
} from './types.js';

/** Nodo de decisión en el que se encuentra el jugador. */
export function currentNode<L extends string>(
  compiled: CompiledKey<L>,
  state: RunState
): KeyNode<L> {
  return getNode(compiled, state.nodeId);
}

/** Número de paso impreso de la clave para el nodo actual ("4"). */
export function currentStepLabel(compiled: CompiledKey<string>, state: RunState): string {
  return compiled.stepLabelByNode.get(state.nodeId) ?? '';
}

/**
 * Avance sobre el camino correcto, entre 0 y 1. Si el jugador está fuera de
 * ese camino se usa la longitud del recorrido, que nunca lo supera.
 */
export function progressRatio(compiled: CompiledKey<string>, state: RunState): number {
  if (state.status === 'won') return 1;
  const total = compiled.correctPath.length;
  if (total === 0) return 0;

  const onPath = compiled.correctPath.indexOf(state.nodeId);
  const done = onPath >= 0 ? onPath : Math.min(state.trail.length, total);
  return done / total;
}

/** Especie a identificar. */
export function targetSpecies<L extends string>(compiled: CompiledKey<L>): KeySpecies<L> {
  return speciesById(compiled, compiled.key.targetSpeciesId);
}

/** Especie por id; lanza si no existe (la validación lo impide en la práctica). */
export function speciesById<L extends string>(
  compiled: CompiledKey<L>,
  speciesId: SpeciesId
): KeySpecies<L> {
  const species = compiled.key.species[speciesId];
  if (!species)
    throw new Error(`Especie desconocida "${speciesId}" en la clave "${compiled.key.id}".`);
  return species;
}

/** Una especie de la rejilla y si sigue siendo posible en el nodo actual. */
export interface SpeciesInPlay<L extends string> {
  readonly species: KeySpecies<L>;
  readonly ruledOut: boolean;
}

/** Todas las especies en orden de presentación, marcando las ya descartadas. */
export function speciesInPlay<L extends string>(
  compiled: CompiledKey<L>,
  state: RunState
): readonly SpeciesInPlay<L>[] {
  const alive = new Set(reachableSpecies(compiled, state.nodeId));
  return compiled.key.displayOrder.map((id) => ({
    species: speciesById(compiled, id),
    ruledOut: !alive.has(id),
  }));
}

/** Especies todavía alcanzables desde un nodo. */
export function reachableSpecies(
  compiled: CompiledKey<string>,
  nodeId: NodeId
): readonly SpeciesId[] {
  return compiled.reachableSpeciesByNode.get(nodeId) ?? [];
}

/** El jugador puede deshacer si está jugando y ya ha dado algún paso. */
export function canUndo(state: RunState): boolean {
  return state.status === 'playing' && state.trail.length > 0;
}

/** Paso del recorrido junto a la opción que se eligió, para poder pintarlo. */
export interface ResolvedStep<L extends string> {
  readonly step: TrailStep;
  readonly option: KeyOption<L>;
}

/** Recorrido del jugador con el texto de cada rama elegida. */
export function resolvedTrail<L extends string>(
  compiled: CompiledKey<L>,
  state: RunState
): readonly ResolvedStep<L>[] {
  return state.trail.map((step) => ({
    step,
    option: getOption(compiled, step.nodeId, step.optionIndex),
  }));
}

/**
 * Texto en el locale pedido, con reserva explícita. Evita que un locale
 * incompleto pinte un hueco vacío en pantalla.
 */
export function resolveText<L extends string>(
  text: LocalizedText<L>,
  locale: L,
  fallback: L
): string {
  return text[locale] || text[fallback] || '';
}
