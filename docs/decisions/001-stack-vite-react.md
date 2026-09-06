# 001 — Stack: Vite + React, no Next/Astro

## Estado

Aceptado.

## Contexto

El primer juego (WildKeys × LO VILOT) y los que vengan después necesitan
cargar una vez con conexión y funcionar 100% offline después — sin
sign-in, sin backend en el camino crítico de juego. Rendimiento objetivo:
tiempo hasta interactivo en el móvil de un asistente a un evento físico,
no un motor gráfico (no hay canvas/WebGL).

## Decisión

- **Vite + React + TypeScript strict.** SPA cliente puro.
- **No Next.js**: está pensado para SSR/streaming/rutas de servidor;
  forzar "carga única offline" contra Next significa pelear el framework
  (`output: 'export'`, apagar RSC, evitar que el router intente ir a red).
- **No Astro**: pensado para contenido mayormente estático con islas de
  interactividad. Estos juegos son una sola isla interactiva de principio
  a fin (múltiples pantallas, estado continuo, cronómetro) — Astro no
  aporta nada que Vite no dé ya.
- PWA vía `vite-plugin-pwa` (Workbox) — precache del app shell completo en
  el install del service worker.

## Consecuencias

- Sin SSR: cualquier necesidad futura de SEO por juego individual queda
  fuera de alcance (no es el objetivo — el SEO del ecosistema vive en
  wildkeys-next).
- El leaderboard (Supabase) es la única feature que depende de red — ver
  [003](003-offline-first-leaderboard-supabase.md).
