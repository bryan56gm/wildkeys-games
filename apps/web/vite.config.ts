import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * El requisito manda sobre la configuración: tras la primera visita con red,
 * todo el app shell (JS, CSS, fuentes, imágenes) tiene que estar en caché. De
 * ahí `generateSW` con precache de todos los assets del build y sin ninguna
 * ruta de datos de juego en runtime.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      // Sin pantallas de "instala esta app": el manifest solo habilita
      // "añadir a pantalla de inicio" si el usuario quiere.
      manifest: {
        name: 'WildKeys Games',
        short_name: 'WildKeys',
        description: 'Minijuegos de identificación de fauna y flora con claves dicotómicas.',
        lang: 'ca',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0d2f27',
        theme_color: '#278a5e',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Todo lo que produce el build entra en el precache del install.
        globPatterns: ['**/*.{js,css,html,woff2,png,jpg,jpeg,webp,svg,pdf}'],
        // La app es una SPA: cualquier ruta desconocida sirve el shell cacheado.
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // Un juego con fotos entra de sobra; el margen evita sorpresas.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Supabase nunca se cachea: sus datos son en vivo o no son.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [],
      },
      devOptions: {
        // El service worker en `pnpm dev` se activa a petición, para poder
        // probar el modo avión sin hacer build.
        enabled: false,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
