import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

/**
 * Los tests de la app cubren contenido y datos (claves, diccionarios), no
 * render: el DOM se prueba con la app en marcha, y la lógica de juego vive en
 * `@wkg/game-engine`, que tiene sus propios tests.
 */
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
});
