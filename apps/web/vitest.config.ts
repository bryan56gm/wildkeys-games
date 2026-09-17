import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Dos clases de test conviven aquí:
 *
 * - **Contenido y datos** (`*.test.ts`): claves y diccionarios.
 * - **Flujo** (`*.test.tsx`): la partida recorrida como la recorre el jugador,
 *   con el router de verdad y el almacenamiento de verdad. Existen porque los
 *   fallos que han llegado al móvil no eran de lógica de juego sino de las
 *   costuras —ruta, sesión y jugador— que ningún test unitario mira.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    // Cada test arranca con su propio almacenamiento: el jugador se guarda en
    // `localStorage` y un test no puede heredar el de otro.
    restoreMocks: true,
  },
});
