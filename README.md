# wildkeys-games

Plataforma de minijuegos de WildKeys — **games.wildkeys.io**, un juego por
ruta. Repo independiente de
[wildkeys-next](https://github.com/bryan56gm/wildkeys-next): sin dependencias
de código ni de infraestructura entre ambos, solo comparten marca.

Primer juego: **WildKeys × LO VILOT** (`/lovilot`), colaboración con una
cervecería para un evento físico — identificar una variedad de lúpulo con una
clave dicotómica y, como reto extra, la marta entre 16 carnívoros de España.

## Empezar

```bash
pnpm install
pnpm dev            # http://localhost:5173/lovilot
```

Sin credenciales de Supabase la app arranca igual: se juega entero y el
marcador queda en modo local. Para la clasificación en vivo, ver
[`supabase/README.md`](supabase/README.md).

| Comando        | Qué hace                                                                   |
| -------------- | -------------------------------------------------------------------------- |
| `pnpm dev`     | Servidor de desarrollo de la PWA.                                          |
| `pnpm build`   | Comprueba tipos y construye a `apps/web/dist` (incluye el service worker). |
| `pnpm preview` | Sirve el build; es donde se prueba el modo offline de verdad.              |
| `pnpm check`   | Tipos + lint + tests. Lo que tiene que pasar antes de un PR.               |
| `pnpm test`    | Tests de los paquetes y del contenido de los juegos.                       |

## Arquitectura

Workspace pnpm con una app y cuatro paquetes. La regla que lo ordena todo:
**el contenido de un juego no contiene lógica, y la lógica no contiene
contenido.**

```
apps/web/                     PWA: un solo deploy, una ruta por juego
  src/app/                      arranque, router, contextos, marca
  src/features/dichotomous-game/  plantilla de juego: las 10 pantallas y el flujo
  src/games/<slug>/             SOLO datos de ese juego: clave, textos, tema, fotos
  src/lib/                      utilidades sin dependencias de negocio
packages/game-engine/         máquina de estados de clave dicotómica (sin React)
packages/ui/                  componentes y tokens de diseño compartidos
packages/i18n/                diccionarios tipados y locale compartido
packages/leaderboard/         Supabase, cola offline y hooks — lo único que toca red
```

Por qué así, y qué se descartó: [`docs/decisions/`](docs/decisions/).

### Offline-first

Requisito no negociable: tras la primera visita con conexión, la app funciona
en modo avión. El service worker (`vite-plugin-pwa`, `generateSW`) precachea
**todo** el app shell en el install; la clave dicotómica y los diccionarios van
embebidos en el bundle, sin peticiones en tiempo de ejecución. Las fuentes van
autoalojadas (`@fontsource`) justo para que entren en ese precache.

La clasificación es lo único que necesita red, y degrada explícitamente: sin
conexión el marcador muestra el último snapshot con un aviso, y la marca se
guarda en cola y se envía sola al recuperar la conexión.

Cómo se comprueba:

```bash
pnpm build && pnpm preview
# abrir la app una vez, luego DevTools → Network → Offline y recargar
```

### Idiomas

Catalán, castellano e inglés. El locale es único para toda la app y cada juego
trae su propio diccionario: las claves de un juego no chocan con las de otro y
TypeScript exige que estén los tres idiomas completos.

## Añadir un juego

Guía completa: [`docs/adding-a-game.md`](docs/adding-a-game.md). En resumen:

1. `apps/web/src/games/<slug>/` con la clave dicotómica, los diccionarios, el
   tema y las fotos.
2. Registrarlo en `apps/web/src/games/registry.ts`.
3. `insert into public.games` en Supabase, si va a tener clasificación.

No hay que tocar ni el motor, ni el UI kit, ni las pantallas: la ruta
`/<slug>`, el precache y el marcador salen solos.

## Material de origen

`docs/game/` es el handoff del equipo de diseño (prototipo hifi, modelo de
datos y assets del primer juego). Es la fuente de verdad del contenido y del
aspecto, y se conserva tal como llegó: no se formatea ni se lintea.

## Licencia

El código está bajo [PolyForm Strict 1.0.0](LICENSE): se puede **leer y usar
para fines no comerciales**, pero no modificar, ni redistribuir, ni vender
copias. Para cualquier otro uso hace falta permiso de WildKeys.

Es a propósito. Este repositorio se hará público para que el trabajo se pueda
ver y estudiar, no para que se reutilice: es un juego hecho para un evento
concreto, con la marca y el contenido de terceros dentro.

El **contenido no es software** y queda fuera de esa licencia: las claves
dicotómicas, las fotografías, los textos y las marcas (WildKeys y LO VILOT)
son de sus autores, con todos los derechos reservados.
