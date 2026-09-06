import type { KeyValueStore } from './types.js';

const DEVICE_ID_KEY = 'wkg.device-id';

/**
 * Identificador anónimo y estable del dispositivo. No identifica a una
 * persona: solo permite marcar "tu entrada" en la clasificación y evitar
 * duplicados evidentes, sin login.
 */
export function resolveDeviceId(store: KeyValueStore): string {
  const existing = store.read(DEVICE_ID_KEY);
  if (existing) return existing;

  const created = randomId();
  store.write(DEVICE_ID_KEY, created);
  return created;
}

/** UUID v4 cuando el entorno lo ofrece; si no, un id aleatorio equivalente. */
export function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
