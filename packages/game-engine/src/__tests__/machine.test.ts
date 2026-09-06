import { beforeEach, describe, expect, it } from 'vitest';
import { compileKey } from '../compile.js';
import { initialRun, runReducer } from '../machine.js';
import { canUndo, currentNode, progressRatio, resolvedTrail, speciesInPlay } from '../selectors.js';
import type { RunEvent, RunState } from '../types.js';
import { validKey } from './fixtures.js';

const compiled = compileKey(validKey);
const send = (state: RunState, ...events: readonly RunEvent[]): RunState =>
  events.reduce((current, event) => runReducer(compiled, current, event), state);

describe('runReducer', () => {
  let run: RunState;
  beforeEach(() => {
    run = initialRun(compiled);
  });

  it('arranca en la raíz, sin pasos ni fallos', () => {
    expect(run).toEqual({
      status: 'playing',
      nodeId: 'n1',
      trail: [],
      fails: 0,
      wrongSpeciesId: null,
    });
  });

  it('avanza al nodo siguiente y registra el paso', () => {
    const next = send(run, { type: 'PICK', optionIndex: 0 });
    expect(next.nodeId).toBe('n2');
    expect(next.trail).toEqual([{ nodeId: 'n1', optionIndex: 0, tag: '1a' }]);
  });

  it('gana al llegar a la especie objetivo', () => {
    const next = send(run, { type: 'PICK', optionIndex: 0 }, { type: 'PICK', optionIndex: 0 });
    expect(next.status).toBe('won');
    expect(next.trail).toHaveLength(2);
  });

  it('falla al llegar a otra especie y retrocede al último nodo correcto', () => {
    const next = send(run, { type: 'PICK', optionIndex: 0 }, { type: 'PICK', optionIndex: 1 });
    expect(next.status).toBe('failed');
    expect(next.wrongSpeciesId).toBe('beta');
    expect(next.fails).toBe(1);
    expect(next.nodeId).toBe('n2');
    expect(next.trail).toEqual([{ nodeId: 'n1', optionIndex: 0, tag: '1a' }]);
  });

  it('vuelve a la raíz si se equivoca en el primer paso', () => {
    const next = send(run, { type: 'PICK', optionIndex: 1 });
    expect(next.status).toBe('failed');
    expect(next.nodeId).toBe('n1');
    expect(next.trail).toEqual([]);
  });

  it('conserva los fallos acumulados entre intentos', () => {
    const next = send(
      run,
      { type: 'PICK', optionIndex: 1 },
      { type: 'DISMISS_FAILURE' },
      { type: 'PICK', optionIndex: 1 }
    );
    expect(next.fails).toBe(2);
  });

  it('deshace el último paso sin penalizar', () => {
    const next = send(run, { type: 'PICK', optionIndex: 0 }, { type: 'UNDO' });
    expect(next.nodeId).toBe('n1');
    expect(next.trail).toEqual([]);
    expect(next.fails).toBe(0);
  });

  it('ignora eventos que no aplican y devuelve el mismo objeto', () => {
    expect(send(run, { type: 'UNDO' })).toBe(run);
    expect(send(run, { type: 'DISMISS_FAILURE' })).toBe(run);

    const won = send(run, { type: 'PICK', optionIndex: 0 }, { type: 'PICK', optionIndex: 0 });
    expect(send(won, { type: 'PICK', optionIndex: 1 })).toBe(won);
  });

  it('reinicia por completo', () => {
    const next = send(run, { type: 'PICK', optionIndex: 1 }, { type: 'RESTART' });
    expect(next).toEqual(initialRun(compiled));
  });
});

describe('selectores', () => {
  const run = initialRun(compiled);

  it('describe el nodo actual', () => {
    expect(currentNode(compiled, run).title.es).toBe('Primer carácter');
  });

  it('mide el progreso sobre el camino correcto', () => {
    expect(progressRatio(compiled, run)).toBe(0);
    const mid = runReducer(compiled, run, { type: 'PICK', optionIndex: 0 });
    expect(progressRatio(compiled, mid)).toBe(0.5);
    const won = runReducer(compiled, mid, { type: 'PICK', optionIndex: 0 });
    expect(progressRatio(compiled, won)).toBe(1);
  });

  it('descarta especies conforme se avanza', () => {
    const mid = runReducer(compiled, run, { type: 'PICK', optionIndex: 0 });
    expect(speciesInPlay(compiled, mid).map((entry) => entry.ruledOut)).toEqual([
      false,
      false,
      true,
    ]);
  });

  it('resuelve el recorrido con el texto de cada rama', () => {
    const mid = runReducer(compiled, run, { type: 'PICK', optionIndex: 0 });
    expect(resolvedTrail(compiled, mid)[0]?.option.text.es).toBe('Con pelo');
  });

  it('solo permite deshacer con pasos dados y en juego', () => {
    expect(canUndo(run)).toBe(false);
    const mid = runReducer(compiled, run, { type: 'PICK', optionIndex: 0 });
    expect(canUndo(mid)).toBe(true);
    const failed = runReducer(compiled, mid, { type: 'PICK', optionIndex: 1 });
    expect(canUndo(failed)).toBe(false);
  });
});
