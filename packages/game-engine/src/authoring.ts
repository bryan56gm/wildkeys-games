import type {
  DichotomousKey,
  KeyNode,
  KeyOption,
  KeySpecies,
  LocalizedText,
  NodeId,
  OptionTarget,
  SpeciesId,
} from './types.js';

/** Rama que lleva a otro paso de la clave. */
export const toNode = (nodeId: NodeId): OptionTarget => ({ kind: 'node', nodeId });

/** Rama terminal: identifica una especie. */
export const toSpecies = (speciesId: SpeciesId): OptionTarget => ({ kind: 'species', speciesId });

/**
 * Declara una clave a partir de mapas `id -> definición`, sin repetir el id
 * dentro de cada entrada. Es azúcar de autoría: el resultado sigue siendo el
 * dato plano que consume el motor.
 */
export function defineKey<L extends string>(input: {
  id: string;
  rootNodeId: NodeId;
  targetSpeciesId: SpeciesId;
  displayOrder: readonly SpeciesId[];
  species: Readonly<Record<SpeciesId, { scientificName: string; name: LocalizedText<L> }>>;
  nodes: Readonly<Record<NodeId, { title: LocalizedText<L>; options: readonly KeyOption<L>[] }>>;
}): DichotomousKey<L> {
  const species: Record<SpeciesId, KeySpecies<L>> = {};
  for (const [id, def] of Object.entries(input.species)) {
    species[id] = { id, ...def };
  }

  const nodes: Record<NodeId, KeyNode<L>> = {};
  for (const [id, def] of Object.entries(input.nodes)) {
    nodes[id] = { id, ...def };
  }

  return {
    id: input.id,
    rootNodeId: input.rootNodeId,
    targetSpeciesId: input.targetSpeciesId,
    displayOrder: input.displayOrder,
    species,
    nodes,
  };
}
