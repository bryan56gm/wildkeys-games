import harvis from '@bryan56gm/harvis-standards';

/**
 * Reglas comunes del ecosistema (`@bryan56gm/harvis-standards`).
 *
 * `docs/game/reference/` queda fuera a propósito: es el prototipo de diseño
 * recibido del equipo de producto, se conserva tal cual y no es código del
 * proyecto.
 */
export default [{ ignores: ['**/dist/**', '**/node_modules/**', 'docs/game/**'] }, ...harvis];
