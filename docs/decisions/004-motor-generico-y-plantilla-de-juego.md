# 004 — Motor genérico, plantilla de juego y contenido por juego

## Estado

Aceptado.

## Contexto

El encargo no es un juego: es la base de una plataforma donde el segundo y el
tercer juego deben costar poco. A la vez, el primer juego es un evento
concreto con fecha, y sobre-construir para juegos que no existen sería peor
que no abstraer nada.

Hacía falta decidir dónde va cada cosa para que "añadir un juego" no signifique
tocar la mecánica ni las pantallas.

## Decisión

Tres capas, con una regla: **el contenido no contiene lógica y la lógica no
contiene contenido.**

1. **`packages/game-engine`** — dato puro y máquina de estados de una clave
   dicotómica. Sin React, sin DOM, sin i18n. Cualquier juego de este tipo lo
   reutiliza aportando su dataset.
2. **`apps/web/src/features/dichotomous-game`** — la plantilla: las diez
   pantallas, el flujo (registro, intento puntuable, reto extra, marcador) y
   los hooks. Parametrizada por una `GameDefinition`.
3. **`apps/web/src/games/<slug>`** — solo configuración y contenido: claves,
   diccionarios, tema y assets.

Decisiones concretas que sostienen esto:

- **El camino correcto se deriva del árbol**, no se declara. El prototipo lo
  tenía como lista aparte (`HOP_PATH`), que puede desincronizarse del
  contenido; `compileKey()` lo calcula y de paso valida el dataset entero.
- **Los textos de un juego son un contrato de tipos** (`GameCopy<C>`), con las
  claves de cada reto generadas por plantilla (`` `${reto}.winTitle` ``).
  Falta un texto o un idioma, falla la compilación.
- **El tema es solo tokens CSS.** Los componentes de `@wkg/ui` no llevan
  colores literales, así que un juego cambia de identidad redefiniendo
  variables.
- **Las pantallas reciben cadenas, no el traductor.** Son presentacionales y se
  pueden probar sin montar i18n.

## Consecuencias

- Añadir un juego de clave dicotómica es contenido + una entrada en el
  registro; no se toca código compartido.
- Un juego que **no** sea de clave dicotómica necesitará su propia plantilla
  junto a `dichotomous-game`. Es lo esperado: `@wkg/ui`, `@wkg/i18n` y
  `@wkg/leaderboard` sí se reutilizan.
- Hay un punto donde el tipado fuerte de un juego se convierte en el tipo
  genérico del catálogo (`registerGame` en `games/registry.ts`). Es un cruce
  deliberado y aislado: TypeScript no relaciona `GameCopy<'hop' | 'carn'>` con
  `GameCopy<string>` aunque en ejecución sean el mismo objeto plano.
- Los paquetes se consumen como fuente TypeScript, sin paso de build propio:
  Vite los transpila y `pnpm -r typecheck` los verifica. Menos piezas que
  mantener y cero desincronización entre `src` y `dist`.
