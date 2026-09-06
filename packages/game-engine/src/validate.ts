import type { DichotomousKey, NodeId, SpeciesId } from './types.js';

/** Error de contenido: la clave no es utilizable tal y como está declarada. */
export class KeyValidationError extends Error {
  readonly keyId: string;
  readonly issues: readonly string[];

  constructor(keyId: string, issues: readonly string[]) {
    super(`La clave "${keyId}" no es válida:\n- ${issues.join('\n- ')}`);
    this.name = 'KeyValidationError';
    this.keyId = keyId;
    this.issues = issues;
  }
}

/**
 * Comprueba la integridad estructural de una clave: referencias, ciclos,
 * alcanzabilidad y unicidad del objetivo. Devuelve la lista de problemas
 * encontrados (vacía si la clave es correcta).
 *
 * Se ejecuta al compilar, así que un dataset roto falla al arrancar y no en
 * mitad de una partida.
 */
export function validateKey(key: DichotomousKey<string>): string[] {
  const issues: string[] = [];
  const nodeIds = new Set(Object.keys(key.nodes));
  const speciesIds = new Set(Object.keys(key.species));

  if (!nodeIds.has(key.rootNodeId)) {
    issues.push(`rootNodeId "${key.rootNodeId}" no existe en nodes.`);
  }
  if (!speciesIds.has(key.targetSpeciesId)) {
    issues.push(`targetSpeciesId "${key.targetSpeciesId}" no existe en species.`);
  }

  for (const [nodeId, node] of Object.entries(key.nodes)) {
    if (node.id !== nodeId) {
      issues.push(`El nodo "${nodeId}" declara id "${node.id}".`);
    }
    if (node.options.length < 2) {
      issues.push(`El nodo "${nodeId}" tiene ${node.options.length} opción(es); mínimo 2.`);
    }
    const tags = new Set<string>();
    for (const option of node.options) {
      if (tags.has(option.tag))
        issues.push(`Etiqueta duplicada "${option.tag}" en el nodo "${nodeId}".`);
      tags.add(option.tag);

      if (option.to.kind === 'node' && !nodeIds.has(option.to.nodeId)) {
        issues.push(
          `La opción "${option.tag}" de "${nodeId}" apunta al nodo inexistente "${option.to.nodeId}".`
        );
      }
      if (option.to.kind === 'species' && !speciesIds.has(option.to.speciesId)) {
        issues.push(
          `La opción "${option.tag}" de "${nodeId}" apunta a la especie inexistente "${option.to.speciesId}".`
        );
      }
    }
  }

  if (issues.length > 0) return issues; // sin referencias sanas, recorrer no aporta nada

  issues.push(...findCycles(key));
  if (issues.length > 0) return issues; // recorrer un grafo cíclico no termina

  const { visitedNodes, speciesRoutes } = walk(key);

  for (const nodeId of nodeIds) {
    if (!visitedNodes.has(nodeId))
      issues.push(`El nodo "${nodeId}" es inalcanzable desde la raíz.`);
  }
  for (const speciesId of speciesIds) {
    if (!speciesRoutes.has(speciesId))
      issues.push(`La especie "${speciesId}" es inalcanzable desde la raíz.`);
  }

  const targetRoutes = speciesRoutes.get(key.targetSpeciesId) ?? 0;
  if (targetRoutes > 1) {
    issues.push(
      `La especie objetivo "${key.targetSpeciesId}" se alcanza por ${targetRoutes} rutas; debe ser única.`
    );
  }

  const ordered = new Set(key.displayOrder);
  for (const speciesId of speciesIds) {
    if (!ordered.has(speciesId)) issues.push(`La especie "${speciesId}" no está en displayOrder.`);
  }
  for (const speciesId of key.displayOrder) {
    if (!speciesIds.has(speciesId))
      issues.push(`displayOrder incluye la especie inexistente "${speciesId}".`);
  }

  return issues;
}

/** Detecta ciclos por DFS con marcado tricolor. */
function findCycles(key: DichotomousKey<string>): string[] {
  const issues: string[] = [];
  const state = new Map<NodeId, 'open' | 'closed'>();

  const visit = (nodeId: NodeId, stack: readonly NodeId[]): void => {
    if (state.get(nodeId) === 'closed') return;
    if (state.get(nodeId) === 'open') {
      issues.push(`Ciclo en la clave: ${[...stack, nodeId].join(' → ')}.`);
      return;
    }
    state.set(nodeId, 'open');
    for (const option of key.nodes[nodeId]?.options ?? []) {
      if (option.to.kind === 'node') visit(option.to.nodeId, [...stack, nodeId]);
    }
    state.set(nodeId, 'closed');
  };

  visit(key.rootNodeId, []);
  return issues;
}

/** Recorre el árbol contando por cuántas rutas distintas se llega a cada especie. */
function walk(key: DichotomousKey<string>): {
  visitedNodes: Set<NodeId>;
  speciesRoutes: Map<SpeciesId, number>;
} {
  const visitedNodes = new Set<NodeId>();
  const speciesRoutes = new Map<SpeciesId, number>();

  const visit = (nodeId: NodeId): void => {
    visitedNodes.add(nodeId);
    for (const option of key.nodes[nodeId]?.options ?? []) {
      if (option.to.kind === 'node') {
        visit(option.to.nodeId);
      } else {
        speciesRoutes.set(option.to.speciesId, (speciesRoutes.get(option.to.speciesId) ?? 0) + 1);
      }
    }
  };

  visit(key.rootNodeId);
  return { visitedNodes, speciesRoutes };
}
