# wildkeys-games — contexto del proyecto

Plataforma de minijuegos que vive en **games.wildkeys.io**, un juego por
ruta (`/lovilot` es el primero). Repo **independiente** de wildkeys-next:
sin dependencias de código ni de infraestructura entre ambos, solo
comparten marca. No importar nada de wildkeys-next; si algo hiciera falta
de allí, se copia explícitamente (como ya se hizo con `docs/game/`).

El primer juego es una colaboración puntual con la cervecería LO VILOT
para un evento físico: identificar una variedad de lúpulo (y, como reto
extra, una marta) mediante una clave dicotómica. Todo el diseño hifi,
pantallas y modelo de datos de ese juego están en `docs/game/` — es la
única fuente de verdad para ese contenido; son prototipos de referencia,
no código de producción a copiar tal cual.

## Decisiones ya cerradas — no volver a discutirlas sin motivo nuevo

| Decisión | ADR |
| --- | --- |
| Vite + React + TS strict, nada de Next/Astro | `docs/decisions/001-stack-vite-react.md` |
| Subdominio propio `games.wildkeys.io/<juego>`, no dentro de WildKeys | `docs/decisions/002-subdominio-games-wildkeys.md` |
| Jugar 100% offline; Supabase solo para leaderboard en tiempo real | `docs/decisions/003-offline-first-leaderboard-supabase.md` |

## Arquitectura objetivo (workspace pnpm)

```
apps/web/               PWA, un solo deploy, rutas por juego (React Router)
  src/games/lovilot/     config y contenido de ESTE juego — nada de lógica aquí
packages/game-engine/    máquina de estados de clave dicotómica, agnóstica del contenido
packages/ui/             componentes compartidos + tokens de diseño (extraídos de docs/game)
packages/i18n/           diccionarios ca/es/en, namespaced por juego
packages/leaderboard/    cliente Supabase tipado + hooks (única parte que toca red)
```

Disciplina: ningún fichero por encima de 300 líneas (lo hace cumplir
`@bryan56gm/harvis-standards`, ya wireado en `eslint.config.js`). Cada
pantalla del mockup es un componente propio; lógica de negocio en hooks,
nunca en componentes de pantalla. No añadir abstracción más allá de lo
que pide la reutilización entre juegos — el propósito de `packages/*` es
justamente esa reutilización, no premisa para más.

## Stack

pnpm · Vite · React 19 · TypeScript strict · vite-plugin-pwa (Workbox) ·
Supabase (leaderboard + Realtime, proyecto propio, no el de `wildkeys`) ·
React Router · ESLint + Prettier vía `@bryan56gm/harvis-standards` ·
lefthook + commitlint (mismo patrón que wildkeys-next).

## Credenciales

Proyecto Supabase propio de esta plataforma — crear entrada nueva en
Sentinel Vault (no reutilizar el proyecto `wildkeys`, que está sellado
para otra infraestructura).

## Memoria

Lo estructural va a `docs/` de este repo (ADRs conforme se tomen
decisiones nuevas). Lo que aprenda HARVIS trabajando aquí, a su carpeta
en `~/.claude/knowledge/projects/` (ver `router/decision-tree.md`).
