-- Clasificación de games.wildkeys.io.
--
-- Diseño multi-juego desde el primer día: `games` es el catálogo y cada marca
-- de `scores` apunta a un juego y a uno de sus retos. Sin login: el cliente
-- escribe con la clave anónima y las garantías las dan RLS y los CHECK.
--
-- Ver docs/decisions/003-offline-first-leaderboard-supabase.md.

-- ─────────────────────────────────────────────────────────────── games ──
create table if not exists public.games (
  slug        text        primary key,
  name        text        not null,
  -- Un juego inactivo deja de aceptar marcas nuevas, pero conserva las suyas.
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),

  constraint games_slug_format check (slug ~ '^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$'),
  constraint games_name_len    check (char_length(btrim(name)) between 1 and 80)
);

comment on table public.games is 'Catálogo de juegos publicados en la plataforma.';

-- ────────────────────────────────────────────────────────────── scores ──
create table if not exists public.scores (
  id          uuid        primary key default gen_random_uuid(),
  game_slug   text        not null references public.games (slug) on update cascade,
  -- Reto dentro del juego ('hop', 'carn'…). Texto libre a propósito: los retos
  -- los define cada juego en su código, no el esquema.
  challenge   text        not null,
  nickname    text        not null,
  elapsed_ms  integer     not null,
  fails       integer     not null,
  -- Identificador anónimo del dispositivo (localStorage). No identifica a una
  -- persona: sirve para marcar "tu entrada" y limitar el intento puntuable.
  device_id   text        not null,
  created_at  timestamptz not null default now(),

  -- Estos CHECK son la única defensa real contra marcas fabricadas por REST
  -- directo. El cliente los replica solo para dar un mensaje mejor.
  constraint scores_challenge_len check (char_length(challenge) between 1 and 32),
  constraint scores_nickname_len  check (char_length(btrim(nickname)) between 2 and 14),
  constraint scores_elapsed_range check (elapsed_ms between 3000 and 7200000),
  constraint scores_fails_range   check (fails between 0 and 999),
  constraint scores_device_len    check (char_length(device_id) between 8 and 64),

  -- Un intento puntuable por dispositivo y reto: la regla del evento, aplicada
  -- en el servidor. El cliente trata el conflicto como "ya estaba publicada".
  constraint scores_one_per_device unique (game_slug, challenge, device_id)
);

comment on table public.scores is 'Marcas de la clasificación, una por dispositivo y reto.';

-- Orden natural de la clasificación: el índice cubre la consulta del Board.
create index if not exists scores_ranking_idx
  on public.scores (game_slug, challenge, elapsed_ms, fails);

-- ───────────────────────────────────────────────────────────────── RLS ──
alter table public.games  enable row level security;
alter table public.scores enable row level security;

-- Catálogo y clasificación son públicos: se ven sin iniciar sesión.
drop policy if exists "games_select_public" on public.games;
create policy "games_select_public"
  on public.games for select
  to anon, authenticated
  using (true);

drop policy if exists "scores_select_public" on public.scores;
create policy "scores_select_public"
  on public.scores for select
  to anon, authenticated
  using (true);

-- Cualquiera puede publicar una marca, pero solo en un juego activo.
drop policy if exists "scores_insert_public" on public.scores;
create policy "scores_insert_public"
  on public.scores for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from public.games g
      where g.slug = game_slug and g.is_active
    )
  );

-- Sin políticas de UPDATE ni DELETE: nadie modifica ni borra desde el cliente.
-- La corrección de una marca es una tarea de administración (service role).

-- ──────────────────────────────────────────────────────────── realtime ──
-- El Board se actualiza en vivo durante el evento con los INSERT de scores.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'scores'
  ) then
    alter publication supabase_realtime add table public.scores;
  end if;
end
$$;

-- ────────────────────────────────────────────────────────────── juegos ──
insert into public.games (slug, name)
values ('lovilot', 'WildKeys × LO VILOT')
on conflict (slug) do nothing;
