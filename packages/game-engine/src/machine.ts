import { getOption, type CompiledKey } from './compile.js';
import type { NodeId, RunEvent, RunState, TrailStep } from './types.js';

/** Estado inicial de un recorrido: en la raíz, sin pasos ni fallos. */
export function initialRun(compiled: CompiledKey<string>): RunState {
  return {
    status: 'playing',
    nodeId: compiled.key.rootNodeId,
    trail: [],
    fails: 0,
    wrongSpeciesId: null,
  };
}

/**
 * Reductor puro del recorrido. Toda la lógica de juego vive aquí: la UI solo
 * despacha eventos y lee selectores, nunca calcula transiciones.
 *
 * Los eventos que no aplican al estado actual devuelven el mismo objeto, de
 * modo que React puede saltarse el re-render sin comprobaciones extra.
 */
export function runReducer(
  compiled: CompiledKey<string>,
  state: RunState,
  event: RunEvent
): RunState {
  switch (event.type) {
    case 'PICK':
      return state.status === 'playing' ? pick(compiled, state, event.optionIndex) : state;

    case 'UNDO':
      return state.status === 'playing' ? undo(state) : state;

    case 'DISMISS_FAILURE':
      return state.status === 'failed'
        ? { ...state, status: 'playing', wrongSpeciesId: null }
        : state;

    case 'RESTART':
      return initialRun(compiled);
  }
}

function pick(compiled: CompiledKey<string>, state: RunState, optionIndex: number): RunState {
  const option = getOption(compiled, state.nodeId, optionIndex);
  const step: TrailStep = { nodeId: state.nodeId, optionIndex, tag: option.tag };
  const trail = [...state.trail, step];

  if (option.to.kind === 'node') {
    return { ...state, nodeId: option.to.nodeId, trail };
  }

  if (option.to.speciesId === compiled.key.targetSpeciesId) {
    return { ...state, status: 'won', trail, wrongSpeciesId: null };
  }

  return {
    status: 'failed',
    fails: state.fails + 1,
    wrongSpeciesId: option.to.speciesId,
    ...rewindToLastCorrectNode(compiled, trail),
  };
}

/**
 * Tras una rama equivocada no se vuelve al principio: se retrocede hasta el
 * último nodo del camino correcto que el jugador ya había alcanzado, y se
 * descarta el paso erróneo que salió de él.
 */
function rewindToLastCorrectNode(
  compiled: CompiledKey<string>,
  trail: readonly TrailStep[]
): { nodeId: NodeId; trail: readonly TrailStep[] } {
  const onCorrectPath = new Set(compiled.correctPath);

  for (let index = trail.length - 1; index >= 0; index -= 1) {
    const step = trail[index];
    if (step && onCorrectPath.has(step.nodeId)) {
      return { nodeId: step.nodeId, trail: trail.slice(0, index) };
    }
  }
  return { nodeId: compiled.key.rootNodeId, trail: [] };
}

function undo(state: RunState): RunState {
  const previous = state.trail.at(-1);
  if (!previous) return state;
  return { ...state, nodeId: previous.nodeId, trail: state.trail.slice(0, -1) };
}
