# 002 — Subdominio propio, no dentro de la plataforma WildKeys

## Estado

Aceptado.

## Contexto

El primer juego es una colaboración puntual con una cervecería (LO
VILOT) para un evento físico. WildKeys (wildkeys-next) aún no ha
lanzado y su SEO está construido para contenido taxonómico (ADR
WK-007, SEO dual Google + motores de respuesta). Stack incompatible con
wildkeys-next: SPA estática sin servidor vs. Next.js SSR + Supabase del
producto principal (ver [001](001-stack-vite-react.md)).

## Decisión

- Repo y deploy propios (`wildkeys-games`), sin dependencia de
  wildkeys-next.
- Dominio: **`games.wildkeys.io`**, genérico y reutilizable — no lleva el
  nombre de ningún partner. Cada colaboración es una ruta:
  `games.wildkeys.io/lovilot` (primer juego), futuros juegos añaden ruta
  nueva sobre el mismo shell técnico.
- Se enlaza desde wildkeys.io (blog/apartado de colaboraciones) cuando el
  producto principal lance — nunca al revés, este repo no importa nada de
  wildkeys-next.

## Consecuencias

- El subdominio sobrevive a cualquier colaboración individual — si acaba
  la relación con LO VILOT, la ruta `/lovilot` se archiva sin tocar el
  dominio ni el resto de juegos.
- Contenido co-brandeado (colores/logo de partners) no se indexa bajo las
  rutas de producto de wildkeys.io.
