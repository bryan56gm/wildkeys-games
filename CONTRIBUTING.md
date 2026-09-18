# Contribuir a wildkeys-games

Se aceptan contribuciones. El código no es libre —ver [LICENSE](LICENSE)— pero
sí está abierto a que alguien lo mejore, y quien lo haga consta con su nombre.

## Qué encaja

- **Fallos**: cualquier cosa que no funcione, sobre todo en móvil. Si puedes,
  abre una issue antes con el modelo, el navegador y qué hiciste para que
  pasara: la mitad de los fallos de este repositorio han sido cosas que solo
  se veían en un teléfono concreto.
- **Accesibilidad y rendimiento**: los dos sitios donde más se agradece una
  mirada de fuera.
- **Traducciones**: los diccionarios están en `apps/web/src/games/<slug>/i18n/`
  y TypeScript avisa si falta alguna clave.
- **Un juego nuevo**: `docs/adding-a-game.md`. Es contenido, no código.

Antes de ponerte con algo grande, abre una issue y lo hablamos. Es más rápido
que descubrir al final que iba en otra dirección.

## Cómo

1. Abre una issue, o comenta en una que ya exista.
2. Rama desde `main`, con nombre `fix/…`, `feature/…` o `docs/…`.
3. `pnpm check` en verde —tipos, lint y tests— antes de abrir el PR.
4. Un PR por asunto, y que el mensaje cuente **por qué**, no solo qué.

El proyecto sigue [Conventional Commits](https://www.conventionalcommits.org) y
lo comprueba un hook al commitear, así que no hace falta que lo memorices.

### Lo que se mira en una revisión

Lo mismo que se le pide al código que ya está:

- Los comentarios explican **por qué**, nunca qué hace la línea de al lado.
- Las pantallas no llevan lógica: va en hooks.
- Nada de texto escrito en el código — todo pasa por el diccionario.
- Los componentes de `@wkg/ui` usan tokens, nunca colores literales.
- El camino correcto de una clave **se deriva del árbol**, nunca se declara.

## Términos de la contribución

Al enviar un pull request declaras que:

1. **Lo que envías es tuyo**, o tienes derecho a enviarlo. Si es de tu trabajo,
   que tu empresa esté de acuerdo.
2. **Le das permiso al titular** (Bryan García Munive) para usar tu aportación,
   modificarla y distribuirla como parte de este proyecto, bajo la licencia del
   proyecto o la que tenga en el futuro. Es un permiso perpetuo y gratuito.
   Hace falta porque sin él nadie podría integrar tu PR sin romper la licencia
   del resto del código.
3. **Conservas la autoría.** No cedes tu copyright: das permiso. Puedes usar tu
   propia aportación donde quieras.
4. **Entiendes que queda en público**: tu nombre, tu correo de git y el mensaje
   del commit se quedan en el historial para siempre.

No hace falta firmar nada aparte: abrir el pull request es aceptar esto.

## Reconocimiento

Git ya guarda la autoría de cada commit, y ahí se queda. Además, quien aporta
algo entra en [CONTRIBUTORS.md](CONTRIBUTORS.md) — si prefieres no aparecer, o
aparecer con otro nombre, dilo en el PR.
