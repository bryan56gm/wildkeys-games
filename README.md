# wildkeys-games

Plataforma de minijuegos de WildKeys — `games.wildkeys.io`, un juego por
ruta. Repo independiente de [wildkeys-next](https://github.com/bryan56gm/wildkeys-next):
sin dependencias de código entre ambos, solo comparten marca.

Primer juego: **LO VILOT** (`/lovilot`), colaboración con una cervecería
para un evento físico — clave dicotómica de identificación de lúpulo.

## Empezar

Ver [CLAUDE.md](CLAUDE.md) para contexto completo, decisiones cerradas
(`docs/decisions/`) y el material fuente del primer juego (`docs/game/`).

```bash
pnpm install
pnpm dev
```

## Stack

Vite + React 19 + TypeScript strict, PWA offline-first (vite-plugin-pwa),
Supabase (leaderboard + Realtime), pnpm workspace.
