import { useCallback, useMemo, useReducer } from 'react';
import {
  compileKey,
  initialRun,
  runReducer,
  type CompiledKey,
  type DichotomousKey,
  type RunEvent,
  type RunState,
} from '@wkg/game-engine';
import type { Locale } from '@/app/i18n/locale';

export interface UseKeyRunResult {
  readonly compiled: CompiledKey<Locale>;
  readonly run: RunState;
  pick(optionIndex: number): void;
  undo(): void;
  dismissFailure(): void;
  restart(): void;
}

/**
 * Conecta el motor con React. La clave se compila (y se valida) una sola vez
 * por dataset; el estado del recorrido vive en un `useReducer` con el reductor
 * puro del motor, así que la UI no calcula nada de juego.
 */
export function useKeyRun(key: DichotomousKey<Locale>): UseKeyRunResult {
  const compiled = useMemo(() => compileKey(key), [key]);
  const reduce = useCallback(
    (state: RunState, event: RunEvent) => runReducer(compiled, state, event),
    [compiled]
  );
  const [run, dispatch] = useReducer(reduce, compiled, initialRun);

  return {
    compiled,
    run,
    pick: useCallback((optionIndex: number) => dispatch({ type: 'PICK', optionIndex }), []),
    undo: useCallback(() => dispatch({ type: 'UNDO' }), []),
    dismissFailure: useCallback(() => dispatch({ type: 'DISMISS_FAILURE' }), []),
    restart: useCallback(() => dispatch({ type: 'RESTART' }), []),
  };
}
