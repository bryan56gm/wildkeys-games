# Prompt inicial — pegar en la primera sesión de Claude Code en este repo

```
Contexto del proyecto
Repo nuevo, independiente de cualquier otro proyecto. Es la base de una
plataforma de minijuegos que vivirá en games.wildkeys.io — cada juego en
una ruta propia (/lovilot ahora, más juegos después bajo el mismo dominio
y el mismo shell técnico). El primer juego es una colaboración puntual
WildKeys × cervecería LO VILOT para un evento físico: el jugador identifica
una variedad de lúpulo con una clave dicotómica, y como reto extra una
clave de 16 carnívoros terrestres de España. Todo el contenido, pantallas,
tokens de diseño y modelo de datos de este primer juego están en
docs/game/ (README.md, DATA_MODEL.md, reference/) — trátalos como la
única fuente de verdad para fidelidad visual y lógica del juego; son un
prototipo HTML de referencia, no código de producción a copiar tal cual.
Las decisiones de arquitectura ya cerradas están en docs/decisions/
(001-003) — no las vuelvas a discutir salvo que encuentres un motivo
concreto nuevo.

Requisito no negociable: carga única offline-first
La app tiene que funcionar sin red tras la primera visita con conexión.
Un service worker precachea TODO el app shell (JS/CSS/fuentes/imágenes)
en el install. Ni sign-in ni fetch de datos de juego en runtime: la clave
dicotómica y el diccionario i18n van embebidos en el bundle. Cero fricción:
nada de pantallas de "instala esta app", es una web normal que cachea sola.

Stack
- Vite + React + TypeScript strict. Nada de Next/Astro/SSR — el
  requisito de carga única offline pelea contra cualquier framework
  pensado para servidor.
- vite-plugin-pwa (Workbox) — generateSW, precache de todo el app shell
  y assets, manifest.webmanifest para "añadir a pantalla de inicio"
  (opcional para el usuario, no obligatorio).
- Supabase SOLO para la clasificación (leaderboard) en tiempo real entre
  dispositivos — es la única parte que necesita red. Todo lo demás del
  juego (jugar la clave, cronómetro, progreso) funciona 100% local y
  offline; el leaderboard es progressive enhancement, no requisito.
- React Router para las rutas por juego (/lovilot, futuros juegos).
- ESLint + Prettier vía @bryan56gm/harvis-standards (ya wireado en
  eslint.config.js/prettier.config.js de la raíz), TS strict, sin `any`.

Arquitectura (workspace pnpm, pensado para reutilizar en futuros juegos)
  apps/web/                    — la PWA, un solo deploy
    src/games/lovilot/         — SOLO config y contenido de este juego:
                                  datos de la clave, i18n, assets. Cero
                                  lógica de UI o de motor aquí.
  packages/game-engine/        — motor de clave dicotómica genérico y
                                  reutilizable: máquina de estados
                                  (node/trail/undo/fail/win), agnóstico
                                  del contenido. Cualquier juego futuro
                                  basado en clave dicotómica lo reusa
                                  pasándole su propio dataset.
  packages/ui/                 — componentes de diseño compartidos:
                                  Button, BottomSheetModal, Card,
                                  ProgressBar, Pill, Timer — tokens de
                                  diseño (colores, spacing, radius) como
                                  variables CSS extraídas de docs/game/,
                                  parametrizables por tema de cada juego
                                  (LO VILOT usa verde+amarillo; otro juego
                                  futuro tendrá su propia paleta).
  packages/i18n/                — loader de diccionarios ca/es/en,
                                  namespaced por juego.
  packages/leaderboard/        — cliente Supabase tipado + hooks
                                  (useSubmitScore, useLeaderboard,
                                  useOfflineQueue). Es el único paquete
                                  que toca red.

Disciplina de código
- Ningún fichero por encima de 300 líneas (lo hace cumplir
  harvis-standards). Las 10 pantallas del mockup (Splash, Header,
  WelcomeModal, Home, RegistrationModal, Play, ZoomOverlay, Fail, Win,
  Board) son componentes separados.
- Extrae hooks: useTimer, useKeyEngine (sobre game-engine), useLeaderboard,
  useOfflineQueue. Nada de lógica de negocio dentro de componentes de
  pantalla.
- Reutiliza de verdad: si dos pantallas comparten un patrón (modal,
  tarjeta, botón grande verde), es un componente de packages/ui, no un
  copy-paste con clases distintas.
- No sobre-construyas: game-engine y ui se justifican porque el propio
  encargo es "base para más juegos" — no añadas abstracciones más allá de
  lo que ese objetivo concreto pide.

Supabase — esquema y reglas
- Proyecto Supabase propio de esta plataforma de juegos (no reutilices
  el proyecto `wildkeys`, sellado en el vault para otra infraestructura).
- Tablas: `games` (slug, nombre) para futuro-proofing multi-juego;
  `scores` (id, game_slug, challenge 'hop'|'carn', nickname, elapsed_ms,
  fails, device_id, created_at).
- RLS: insert público (anon) pero con CHECK constraints server-side —
  elapsed_ms por encima de un mínimo realista, nickname máx 14
  caracteres, fails >= 0 — para que un cliente no pueda insertar
  cualquier marca fabricada vía REST directo. Select público (leaderboard
  es visible sin login). Sin update/delete desde el cliente.
- Realtime activado en `scores` (postgres_changes) filtrado por
  game_slug+challenge, para que el Board se actualice en vivo mientras
  otros juegan en el evento.
- device_id anónimo generado y guardado en localStorage — sin login, solo
  para poder resaltar "tu entrada" y evitar duplicados obvios.

Offline + leaderboard, cómo conviven
- Jugar la clave (Play/Fail/Win) no depende de red en ningún momento —
  100% local, igual que en el prototipo (localStorage para progreso,
  intento en curso, "ya he competido").
- Al terminar una partida puntuable: si hay red, se envía el score a
  Supabase y se suscribe al canal realtime del Board. Si no hay red, el
  score se guarda en una cola local (localStorage/IndexedDB) marcado como
  "pendiente de sincronizar" y se reintenta solo cuando vuelve la conexión
  (sin bloquear ni molestar al jugador).
- El Board, sin red, muestra el último snapshot de clasificación cacheado
  con un aviso de "sin conexión, clasificación no actualizada" — nunca
  pantalla en blanco ni error duro.

Entregable de esta sesión
1. Setup del workspace y el esqueleto de apps/web + los 4 packages.
2. Motor de clave dicotómica genérico en game-engine, con tests.
3. UI kit con los tokens de diseño del mockup.
4. Juego LO VILOT completo (10 pantallas) montado sobre engine+ui,
   fiel al prototipo hifi de docs/game/reference/.
5. PWA offline-first funcionando (precache verificado, probado en modo
   avión tras primera carga).
6. Esquema + RLS + realtime de Supabase, con el flujo de cola offline.
7. README del repo explicando cómo añadir un juego nuevo (qué va en
   src/games/<slug>/, qué reutiliza de los packages).

Antes de escribir código, confirma conmigo el plan de estructura de
carpetas y el esquema de Supabase si ves algo que no cuadra con lo
descrito arriba.
```
