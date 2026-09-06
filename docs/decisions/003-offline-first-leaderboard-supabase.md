# 003 — Offline-first para el juego, Supabase solo para el leaderboard

## Estado

Aceptado.

## Contexto

Requisito no negociable: jugar debe funcionar sin red tras la primera
carga (evento físico, wifi/datos no garantizados). Pero la clasificación
(leaderboard) sí queremos que se sincronice en tiempo real entre
dispositivos durante el evento.

## Decisión

- **Jugar es 100% local.** Clave dicotómica, cronómetro, progreso y
  assets van precacheados por el service worker (`vite-plugin-pwa` /
  Workbox, `generateSW`) en el install. Nunca depende de red.
- **Leaderboard es la única feature online**, con degradación explícita:
  - Con red: al terminar una partida puntuable se envía el score a
    Supabase y se suscribe al canal Realtime (`postgres_changes`) filtrado
    por `game_slug` + `challenge` para ver la clasificación en vivo.
  - Sin red: el score se guarda en una cola local (localStorage/IndexedDB)
    marcado como pendiente, se reintenta solo al recuperar conexión. El
    Board muestra el último snapshot cacheado con aviso de "sin conexión,
    clasificación no actualizada" — nunca pantalla en blanco ni error.
- **Proyecto Supabase propio de esta plataforma**, separado del proyecto
  `wildkeys` (sellado en el vault, es infraestructura de otro producto).
- Sin login: `device_id` anónimo en localStorage + nickname (máx 14
  caracteres) para poder resaltar "tu entrada" sin fricción.
- RLS: insert público (anon) con CHECK constraints server-side
  (`elapsed_ms` por encima de un mínimo realista, `fails >= 0`, longitud
  de nickname) para que un cliente no pueda fabricar cualquier marca vía
  REST directo. Select público. Sin update/delete desde cliente.

## Consecuencias

- El leaderboard es gameable por alguien decidido (sin backend de
  validación fuerte) — riesgo aceptado a propósito: es un juego de evento,
  no un sistema con apuestas reales. No sobre-invertir en anti-cheat.
- Esquema pensado para multi-juego desde el día uno: tabla `games` +
  `scores.game_slug`, no una tabla por evento.
