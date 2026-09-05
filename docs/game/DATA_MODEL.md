# Data model — extract to JSON, keep out of UI code

The source of truth for both dichotomous keys and all i18n strings lives in `reference/WildKeys LO VILOT v3.dc.html`, inside the component's logic class. A senior implementation should pull these into standalone data files (e.g. `data/hopKey.json`, `data/carnivoreKey.json`, `data/i18n/{ca,es,en}.json`) instead of hardcoding them in components.

## 1. Species dictionaries
`HOP_SP` and `CARN_SP` in the source file: each species has a stable id (e.g. `vista`, `martes`), a scientific name (`sci`), and localized display names (`n.ca/es/en`).

- Hop species (6): chinook, cascade, cashmere, comet, **vista** (target), raku.
- Carnivore species (16): ursus, lutra, lynx, procyon, genetta, felis, canis, vulpes, meles, nivalis, herpestes, foina, **martes** (target), lutreola, vison, putorius.

## 2. Key trees
`HOP_K` and `CARN_K`: a map of node id → `{ title: {ca,es,en}, o: [ {tag, to: {n: nextNodeId} | {sp: speciesId}, x: {ca,es,en}} ] }`.
- Each node is a decision point with 2–3 options.
- An option either points to another node (`to.n`) or terminates at a species (`to.sp`).
- `tag` is the display label shown on the option chip (e.g. `"2a"`).
- `x` is the long descriptive text for that branch, per language.

`HOP_PATH` / `CARN_PATH` list the sequence of node ids that form the **correct route to the target species** — used to compute progress % and to know where to resume after a wrong answer (rewind to the last node on this list that's in the player's trail).

`HOP_ORDER` / `CARN_ORDER` list all species ids in display order for the "species still in play" grid.

`HOP_TARGET = 'vista'`, `CARN_TARGET = 'martes'`.

Recursive helper `leaves(K, nodeId)` walks all reachable species from a node — used to compute which species are still "alive" (not yet ruled out) given the current node.

## 3. i18n dictionary
`T.ca`, `T.es`, `T.en` — flat key→string maps (~70 keys each) covering all UI copy: headings, button labels, empty states, formatted strings with `{n}`/`{t}` placeholders (e.g. `outFmt: 'En queden {n} de 6'`, replaced via `.replace('{n}', value)`).

Recreate as three JSON files or a single `{ca:{...}, es:{...}, en:{...}}` object, loaded by an i18n layer keyed by the same flat keys — do not restructure the keys, since the design's copy review was done against these exact strings.

## 4. Persistence keys (localStorage / sessionStorage)
| Key | Storage | Purpose |
|---|---|---|
| `wk_hop_board_v1` | localStorage | Leaderboard for the hop challenge: array of `{name, ms, fails, me?}` |
| `wk_carn_board_v1` | localStorage | Leaderboard for the carnivore challenge, same shape |
| `wk_vilot_player_v1` | localStorage | The one registered player on this device: `{nick, hopStartedAt, hopDone, hopMs, hopFails, carnStartedAt, carnDone, carnMs, carnFails}` |
| `wk_vilot_welcome_v1` | localStorage | Whether the welcome modal has been dismissed once |
| `wk_vilot_splash_v1` | sessionStorage | Whether the splash screen has played this session |

Demo/placeholder leaderboard rows (`DEMO_HOP`, `DEMO_CARN` in source) are static seed data merged in for display only — flag with `demo:true` and exclude from real ranking logic once real data exists, or keep as a "seed rows" toggle (design already exposes this as a tweakable prop `demoBoard`).

## 5. Game flow (state machine)
```
splash --(8.2s or skip if already seen this session)--> home
home --(register)--> registration modal --(confirm)--> play(hop, scored)
home --(free play)--> play(hop, unscored)
home --(resume)--> play(ch = whichever challenge isn't done yet, scored)
play --(correct leaf)--> win
play --(wrong leaf)--> fail --(retry)--> play (resumes at last correct node)
win (hop, scored) --(accept bonus)--> play(carn, scored)
win/home --(board)--> board
board --(back)--> home
play --(photo tap)--> zoom overlay --(tap outside)--> play
```
One scored attempt per challenge per device; everything else is unlimited free play.
