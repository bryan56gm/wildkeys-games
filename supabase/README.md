# Base de datos de la clasificación

Proyecto Supabase **propio de esta plataforma** — no se reutiliza el proyecto
`wildkeys`, que es infraestructura de otro producto (ver
[ADR 003](../docs/decisions/003-offline-first-leaderboard-supabase.md)).

Es la única parte del sistema que necesita red: el juego se juega entero sin
conexión.

## Qué hay aquí

| Fichero                                          | Qué es                                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `migrations/20260906120000_init_leaderboard.sql` | Tablas `games` y `scores`, CHECK, RLS, índices, Realtime y el alta del juego `lovilot`. |

## Aplicar el esquema

Con el [CLI de Supabase](https://supabase.com/docs/guides/cli) y el proyecto ya
creado:

```bash
supabase link --project-ref <ref-del-proyecto>
supabase db push
```

Sin CLI: pegar el contenido de la migración en el editor SQL del panel. Es
idempotente (`if not exists` / `on conflict do nothing`), se puede repetir.

## Configurar la app

```bash
cp apps/web/.env.example apps/web/.env.local
# VITE_SUPABASE_URL=https://<ref>.supabase.co
# VITE_SUPABASE_ANON_KEY=<clave anónima>
```

Sin estas variables la app arranca igual: el juego funciona y el marcador queda
en modo local (las marcas se guardan en cola). Las credenciales van al Sentinel
Vault, nunca al repositorio.

## Regenerar los tipos

```bash
supabase gen types typescript --project-id <ref> --schema public \
  > packages/leaderboard/src/database.types.ts
```

## Añadir un juego

```sql
insert into public.games (slug, name) values ('<slug>', '<nombre>');
```

El `slug` debe coincidir con el de `apps/web/src/games/<slug>/`. Sin esa fila,
la política de inserción rechaza las marcas de ese juego.
