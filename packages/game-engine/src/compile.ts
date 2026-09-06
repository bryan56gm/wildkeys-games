import type { DichotomousKey, KeyNode, KeyOption, NodeId, SpeciesId } from './types.js';
import { KeyValidationError, validateKey } from './validate.js';

/**
 * Clave ya validada y con todos los derivados precalculados. Compilar una vez
 * al cargar el juego deja el runtime en O(1): ni la UI ni la máquina de
 * estados recorren el grafo en cada render.
 */
export interface CompiledKey<L extends string = string> {
  readonly key: DichotomousKey<L>;
  /** Nodos de decisión desde la raíz hasta el que identifica al objetivo. */
  readonly correctPath: readonly NodeId[];
  /** Índice de la opción que continúa por el camino correcto, por nodo. */
  readonly correctOptionByNode: ReadonlyMap<NodeId, number>;
  /** Especies todavía posibles al estar situado en un nodo dado. */
  readonly reachableSpeciesByNode: ReadonlyMap<NodeId, readonly SpeciesId[]>;
  /** Número de paso impreso en la clave ("4a"/"4b" → "4"), por nodo. */
  readonly stepLabelByNode: ReadonlyMap<NodeId, string>;
}

/**
 * Valida y compila una clave. Lanza {@link KeyValidationError} si el dataset
 * no es coherente — es un error de contenido, no un estado recuperable.
 */
export function compileKey<L extends string>(key: DichotomousKey<L>): CompiledKey<L> {
  const issues = validateKey(key);
  if (issues.length > 0) throw new KeyValidationError(key.id, issues);

  const { correctPath, correctOptionByNode } = solveCorrectPath(key);

  return {
    key,
    correctPath,
    correctOptionByNode,
    reachableSpeciesByNode: computeReachableSpecies(key),
    stepLabelByNode: computeStepLabels(key),
  };
}

/** Devuelve el nodo `nodeId`, o lanza si no existe (post-validación no ocurre). */
export function getNode<L extends string>(compiled: CompiledKey<L>, nodeId: NodeId): KeyNode<L> {
  const node = compiled.key.nodes[nodeId];
  if (!node) throw new Error(`Nodo desconocido "${nodeId}" en la clave "${compiled.key.id}".`);
  return node;
}

/** Devuelve la opción `optionIndex` del nodo, o lanza si el índice no existe. */
export function getOption<L extends string>(
  compiled: CompiledKey<L>,
  nodeId: NodeId,
  optionIndex: number
): KeyOption<L> {
  const option = getNode(compiled, nodeId).options[optionIndex];
  if (!option) throw new Error(`Opción ${optionIndex} inexistente en el nodo "${nodeId}".`);
  return option;
}

/**
 * Ruta única desde la raíz hasta la especie objetivo. Se deriva del árbol en
 * vez de declararse a mano: el contenido no puede desincronizarse del camino.
 */
function solveCorrectPath(key: DichotomousKey<string>): {
  correctPath: readonly NodeId[];
  correctOptionByNode: ReadonlyMap<NodeId, number>;
} {
  const correctOptionByNode = new Map<NodeId, number>();

  const search = (nodeId: NodeId): NodeId[] | null => {
    const options = key.nodes[nodeId]?.options ?? [];
    for (const [index, option] of options.entries()) {
      if (option.to.kind === 'species') {
        if (option.to.speciesId !== key.targetSpeciesId) continue;
        correctOptionByNode.set(nodeId, index);
        return [nodeId];
      }
      const tail = search(option.to.nodeId);
      if (tail) {
        correctOptionByNode.set(nodeId, index);
        return [nodeId, ...tail];
      }
    }
    return null;
  };

  const correctPath = search(key.rootNodeId);
  if (!correctPath) {
    throw new KeyValidationError(key.id, [
      `No hay ninguna ruta desde "${key.rootNodeId}" hasta la especie objetivo "${key.targetSpeciesId}".`,
    ]);
  }
  return { correctPath, correctOptionByNode };
}

/** Hojas alcanzables desde cada nodo, memoizado de abajo a arriba. */
function computeReachableSpecies(
  key: DichotomousKey<string>
): ReadonlyMap<NodeId, readonly SpeciesId[]> {
  const cache = new Map<NodeId, readonly SpeciesId[]>();

  const resolve = (nodeId: NodeId): readonly SpeciesId[] => {
    const cached = cache.get(nodeId);
    if (cached) return cached;

    const found = new Set<SpeciesId>();
    for (const option of key.nodes[nodeId]?.options ?? []) {
      if (option.to.kind === 'species') found.add(option.to.speciesId);
      else for (const id of resolve(option.to.nodeId)) found.add(id);
    }

    // Se preserva el orden de presentación para que la rejilla no baile.
    const ordered = key.displayOrder.filter((id) => found.has(id));
    cache.set(nodeId, ordered);
    return ordered;
  };

  for (const nodeId of Object.keys(key.nodes)) resolve(nodeId);
  return cache;
}

/** El número de paso es el prefijo numérico compartido por las etiquetas del nodo. */
function computeStepLabels(key: DichotomousKey<string>): ReadonlyMap<NodeId, string> {
  const labels = new Map<NodeId, string>();
  for (const [nodeId, node] of Object.entries(key.nodes)) {
    const firstTag = node.options[0]?.tag ?? '';
    labels.set(nodeId, firstTag.replace(/[^0-9]+$/u, '') || firstTag);
  }
  return labels;
}
