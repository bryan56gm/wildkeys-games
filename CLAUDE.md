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

| Decisión                                                             | ADR                                                         |
| -------------------------------------------------------------------- | ----------------------------------------------------------- |
| Vite + React + TS strict, nada de Next/Astro                         | `docs/decisions/001-stack-vite-react.md`                    |
| Subdominio propio `games.wildkeys.io/<juego>`, no dentro de WildKeys | `docs/decisions/002-subdominio-games-wildkeys.md`           |
| Jugar 100% offline; Supabase solo para leaderboard en tiempo real    | `docs/decisions/003-offline-first-leaderboard-supabase.md`  |
| Motor genérico + plantilla de juego + contenido por juego            | `docs/decisions/004-motor-generico-y-plantilla-de-juego.md` |

## Arquitectura (workspace pnpm) — ya construida

La regla que ordena todo: **el contenido no contiene lógica y la lógica no
contiene contenido.**

```
apps/web/                          PWA, un solo deploy, una ruta por juego
  src/app/                           arranque, router, contextos, marca WildKeys
  src/features/dichotomous-game/     plantilla de juego: las 10 pantallas y el flujo
  src/games/<slug>/                  SOLO datos: clave, textos, tema, assets
  src/lib/                           storage, formato, entorno — sin negocio
packages/game-engine/              clave dicotómica: dato, validación y reducer (sin React)
packages/ui/                       tokens de diseño y componentes compartidos
packages/i18n/                     diccionarios tipados y locale compartido
packages/leaderboard/              Supabase, cola offline y hooks — lo único que toca red
supabase/migrations/               esquema, RLS, CHECK y Realtime
```

### Dónde tocar según la tarea

| Quiero…                         | Voy a…                                                                   |
| ------------------------------- | ------------------------------------------------------------------------ |
| Añadir un juego                 | `docs/adding-a-game.md` — contenido + una entrada en `games/registry.ts` |
| Cambiar la mecánica de la clave | `packages/game-engine/src/machine.ts` (+ sus tests)                      |
| Cambiar una pantalla            | `apps/web/src/features/dichotomous-game/screens/`                        |
| Cambiar un texto                | `apps/web/src/games/<slug>/i18n/{ca,es,en}.ts`                           |
| Cambiar colores o espaciados    | `packages/ui/src/styles/tokens.css`, o el tema del juego                 |
| Tocar la clasificación          | `packages/leaderboard/` y `supabase/migrations/`                         |

### Invariantes que no se rompen

- Jugar nunca va a red. Lo único que sale es la clasificación, y degrada sola.
- El camino correcto de una clave **se deriva del árbol**, nunca se declara.
- Los componentes de `@wkg/ui` no llevan colores literales, solo tokens.
- Nada de texto escrito en el código: todo pasa por el diccionario del juego.
- Ningún fichero por encima de 300 líneas (lo hace cumplir
  `@bryan56gm/harvis-standards`). Lógica en hooks, nunca en componentes de
  pantalla.
- No añadir abstracción más allá de lo que pide la reutilización entre juegos.

## Stack

pnpm · Vite · React 19 · TypeScript strict · vite-plugin-pwa (Workbox) ·
Supabase (leaderboard + Realtime, proyecto propio, no el de `wildkeys`) ·
React Router · ESLint + Prettier vía `@bryan56gm/harvis-standards` ·
lefthook + commitlint (mismo patrón que wildkeys-next).

## Comandos

`pnpm dev` · `pnpm build` · `pnpm preview` (aquí se prueba el offline real) ·
`pnpm check` (tipos + lint + tests, lo que debe pasar antes de un PR).

## Credenciales

Proyecto Supabase propio de esta plataforma — crear entrada nueva en
Sentinel Vault (no reutilizar el proyecto `wildkeys`, que está sellado
para otra infraestructura). Las variables van a `apps/web/.env.local`
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); sin ellas la app arranca
igual y el marcador queda en modo local.

## Memoria

Lo estructural va a `docs/` de este repo (ADRs conforme se tomen
decisiones nuevas). Lo que aprenda HARVIS trabajando aquí, a su carpeta
en `~/.claude/knowledge/projects/` (ver `router/decision-tree.md`).
