# Añadir un juego a la plataforma

Un juego nuevo es **contenido**, no código: una clave dicotómica, sus textos,
una paleta y unas fotos. La mecánica ya está en `packages/game-engine` y las
pantallas en `apps/web/src/features/dichotomous-game`.

Si el juego nuevo no es de clave dicotómica, esto no aplica: haría falta una
plantilla nueva junto a `dichotomous-game`, reutilizando `@wkg/ui`,
`@wkg/i18n` y `@wkg/leaderboard`.

## 1. Crear la carpeta del juego

```
apps/web/src/games/<slug>/
  index.ts                 la GameDefinition (lo único que ve el resto de la app)
  theme.module.css         paleta: redefine los tokens de @wkg/ui
  content/<clave>.ts       la clave dicotómica
  i18n/{types,ca,es,en}.ts los diccionarios
  assets/                  fotos y logos
  __tests__/content.test.ts
```

`<slug>` es el de la URL (`games.wildkeys.io/<slug>`): minúsculas, guiones.

## 2. Declarar la clave dicotómica

```ts
import { defineKey, toNode, toSpecies } from '@wkg/game-engine';

export const myKey = defineKey<Locale>({
  id: '<slug>.<reto>',
  rootNodeId: 'n1',
  targetSpeciesId: 'objetivo', // la especie que hay que identificar
  displayOrder: ['objetivo', '…'], // orden de la rejilla de candidatas
  species: {
    objetivo: { scientificName: 'Genus species', name: { ca: '…', es: '…', en: '…' } },
  },
  nodes: {
    n1: {
      title: { ca: '…', es: '…', en: '…' },
      options: [
        { tag: '1a', to: toNode('n2'), text: { ca: '…', es: '…', en: '…' } },
        { tag: '1b', to: toSpecies('otra'), text: { ca: '…', es: '…', en: '…' } },
      ],
    },
  },
});
```

**El camino correcto no se declara**: el motor lo deriva del árbol, así que el
contenido no puede quedar desincronizado. `compileKey()` valida referencias,
ciclos, alcanzabilidad y que el objetivo se alcance por una sola ruta, y falla
al arrancar si algo no cuadra.

El número de paso que se ve en pantalla sale del prefijo numérico de las
etiquetas (`4a`/`4b` → paso `4`): numerar bien las `tag` es parte del
contenido.

## 3. Escribir los diccionarios

```ts
// i18n/types.ts
export type MyChallenge = 'reto1' | 'reto2';
export type MyCopy = GameCopy<MyChallenge>;
```

`GameCopy<C>` exige los textos comunes (portada, registro, victoria, marcador…)
más, por cada reto, las claves `<reto>.name`, `<reto>.caption`,
`<reto>.winTitle`… Un reto marcado `bonus` necesita además sus
`<reto>.bonusTitle` y compañía.

Se escribe primero el diccionario de referencia con `satisfies MyCopy` y los
otros dos con `: MyCopy`. **TypeScript enumera lo que falte**: no hace falta
buscar textos a mano.

Los marcadores `{n}`, `{t}` se sustituyen al traducir; consérvalos.

## 4. Definir el tema

```css
/* theme.module.css */
.theme {
  --wk-color-brand: #…;
  --wk-color-brand-hover: #…;
  --wk-color-accent: #…;
  --wk-splash-gradient: linear-gradient(180deg, #…, #…);
}
```

Solo tokens semánticos. Los componentes de `@wkg/ui` nunca llevan colores
literales, así que con esto cambia la identidad entera del juego. La lista
completa está en `packages/ui/src/styles/tokens.css`.

## 5. Montar la definición

```ts
export const myGame: GameDefinition<MyChallenge> = {
  slug: '<slug>',
  themeClass: theme.theme ?? '',
  i18n: myBundle,
  externalCtaHref: 'https://wildkeys.io',
  sponsor: { name: '…', logoSrc },          // opcional
  challenges: [
    { id: 'reto1', key: myKey, photo: { src: fotoReto1 }, speciesColumns: 3 },
    { id: 'reto2', key: otraKey, photo: {}, speciesColumns: 4, bonus: true },
  ],
  demoScores: [ … ],                        // opcional: marcador no vacío el día 1
};
```

El primer reto es el principal; los marcados `bonus` se ofrecen al ganar el
anterior. Un `photo` sin `src` pinta un marcador con su texto alternativo, así
que se puede desarrollar el juego antes de tener las fotos.

## 6. Registrarlo

```ts
// apps/web/src/games/registry.ts
{
  slug: '<slug>',
  title: '…',
  tagline: { ca: '…', es: '…', en: '…' },
  load: async () => registerGame((await import('./<slug>')).myGame),
}
```

La ruta `/<slug>`, la carga diferida y el precache salen de aquí. No hay que
tocar el router.

## 7. Darlo de alta en la clasificación

```sql
insert into public.games (slug, name) values ('<slug>', '…');
```

Sin esa fila, la política de inserción de Supabase rechaza las marcas de ese
juego. Si el juego no lleva clasificación, se puede omitir: el marcador se
queda vacío y el juego funciona igual.

## 8. Comprobarlo

```ts
// __tests__/content.test.ts
expect(validateGameDefinition(myGame as unknown as AnyGameDefinition)).toEqual([]);
```

Copia el test de `games/lovilot/__tests__/content.test.ts`: valida las claves,
comprueba que los tres idiomas están completos y fija por escrito el camino
correcto de cada reto. Después:

```bash
pnpm check
```

## Lo que no hay que hacer

- **Poner lógica o JSX en `games/<slug>/`.** Si una pantalla necesita algo que
  no existe, va en `features/dichotomous-game` parametrizado por la
  definición, no en el juego.
- **Colores literales en componentes.** Van como token en el tema.
- **Textos en el código.** Todos pasan por el diccionario, incluidos los
  mensajes de error.
- **Pedir datos por red al jugar.** El juego es offline-first: la clave y los
  textos viajan en el bundle. Lo único que sale a red es la clasificación.
