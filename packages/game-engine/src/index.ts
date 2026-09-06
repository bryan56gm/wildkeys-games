/**
 * Motor de claves dicotómicas — dato puro + máquina de estados, sin React ni
 * DOM. Cualquier juego de la plataforma lo reutiliza aportando su dataset.
 *
 * Uso típico:
 * ```ts
 * const compiled = compileKey(hopKey);         // valida y precalcula
 * let run = initialRun(compiled);              // estado inicial
 * run = runReducer(compiled, run, { type: 'PICK', optionIndex: 1 });
 * ```
 */
export * from './types.js';
export * from './authoring.js';
export { KeyValidationError, validateKey } from './validate.js';
export { compileKey, getNode, getOption, type CompiledKey } from './compile.js';
export { initialRun, runReducer } from './machine.js';
export * from './selectors.js';
