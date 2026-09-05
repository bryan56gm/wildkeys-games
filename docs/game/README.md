# Handoff: WildKeys × LO VILOT — Joc mòbil de clau dicotòmica

## Overview
Mini-joc web mòbil de promoció per a l'esdeveniment WildKeys × LO VILOT. El jugador identifica una varietat de llúpol (Vista) recorrent una clau dicotòmica pas a pas, competint contra rellotge en un rànquing local. En guanyar, se li ofereix un repte extra: identificar la marta (Martes martes) dins d'una clau de 16 carnívors terrestres d'Espanya. Trilingüe (CA/ES/EN), funciona offline, pensat per usar-se en un mòbil durant l'esdeveniment físic.

## About the Design Files
Els fitxers d'aquest paquet (`reference/`) són **prototips HTML de referència de disseny**, no codi de producció per copiar tal qual. Recreeu aquest disseny al vostre entorn habitual (React Native, Next.js, Swift/Kotlin natiu, etc.) seguint els patrons i llibreries ja establerts al vostre projecte. Si encara no hi ha cap entorn triat, es recomana una PWA mòbil (React o Svelte + Vite) atès que el disseny és 100% mòbil, offline-first i sense backend.

## Fidelity
**Alta fidelitat (hifi).** Colors, tipografies, espaiats i micro-interaccions del prototip són el disseny final: reproduïu-los píxel a píxel.

## Screens / Views

### 1. Splash (pantalla de càrrega)
- Fons: gradient vertical `#0d2f27 → #134539 → #1a5c42 → #237050 → #2c8259 → #3a9564` (dalt fosc a baix clar), amb un halo groc suau (`rgba(251,191,36,.35)`) al 14% superior i textura de gra (radial-gradient de punts, opacitat .05).
- Contingut centrat verticalment: dos cercles blancs de 72×72px (fons `rgba(255,255,255,.95)`, `box-shadow: 0 8px 30px rgba(0,0,0,.25)`) separats per una "×" — un amb el logo WildKeys (SVG, veure Assets), l'altre amb el logo LO VILOT (imatge). **El logo de dins de cada cercle ha d'estar centrat, mai desbordar el cercle.**
- Sota: "WildKeys" (Merriweather 700, 30px, blanc) — separador amb "×" — "LO VILOT" (Merriweather 700, 22px, groc `#fbbf24`).
- Kicker en majúscules (11px, .16em letter-spacing) + píndola amb punt pulsant verd + text "Carregant…".
- Barra de progrés (3px alçada, gradient `#5cc791 → #fbbf24`) que s'omple en 8s; en acabar (o després de 8.2s) es passa a Home.
- Es mostra només un cop per sessió (sessionStorage).

### 2. Header (persistent a totes les pantalles excepte splash)
- Esquerra: logo WildKeys (28px alçada, color `#278a5e`) + "WildKeys" (Merriweather 700, 14px, `#194836`) + subtítol en majúscules (7.5px, `#5cc791`).
- Dreta: rellotge (només durant partida/victòria) en píndola verda clara; selector d'idioma CA/ES/EN (píndoles, actiu = fons `#278a5e` text blanc).

### 3. Welcome modal (primer cop a Home)
- Modal **fixat a la pantalla del dispositiu** (no al canvas/vista prèvia), centrat, sense scroll intern. Overlay `rgba(25,35,30,.55)`.
- Targeta blanca, `border-radius:24px`, padding 24/22px, contingut centrat: cercle 56px amb gradient verd clar i logo WildKeys; títol (Merriweather 700, 22px, `#194836`); cos (14px, `#57534e`); avís groc (`#fffbeb`/`#fde68a`) amb emoji 🍺 sobre la col·laboració amb LO VILOT; botó verd ple ("Entesos, anem-hi!").
- Es descarta un únic cop (localStorage) i no torna a sortir.

### 4. Home
- Badge "WildKeys × LO VILOT", títol H1 (Merriweather 700, 28px), subtítol.
- Targeta groga (LO VILOT): logo quadrat arrodonit + nom + subtítol + descripció.
- Targeta blanca amb foto (image slot 180px) + "El teu objectiu" + nom "Vista" en cursiva.
- Targeta amb el nom de la clau que es farà servir.
- CTA principal verd ple "Començar el repte" (si encara no hi ha jugador registrat) → obre modal de registre.
- Si ja ha competit: targeta amb inicial + nom + nota d'estat.
- Si té una partida en curs: botó "Continuar el meu intent".
- Fila secundària: "Mode lliure" / "Classificació" (outline).

### 5. Registration modal (bottom sheet)
- Overlay fosc, targeta ancorada a baix (`align-items:flex-end`), `border-radius:22px` només dalt, anima cap amunt.
- Kicker + títol + cos, input de nom (màx 14 caràcters), missatge d'error en vermell si cal, avís groc que el cronòmetre comença en registrar-se, botons "Ara no" / "Registrar-me i començar" (verd ple, flex 1).

### 6. Play (clau dicotòmica)
- Targeta amb foto de l'objectiu (160px, clicable → zoom), badge "Ampliar" a sobre a la dreta; peu amb nom científic + número de pas.
- Barra de progrés fina (5px) segons profunditat al camí correcte.
- Graella de "varietats en joc": totes les espècies possibles, les descartades es mostren atenuades i ratllades (transició de 0.4s).
- Bloc de decisió: títol del node + 2-3 botons d'opció (cadascun amb una etiqueta tipus "1a"/"1b" i el text descriptiu llarg en Merriweather).
- Rastre de passos fets (píndoles amb l'etiqueta) + botó "Desfer pas".
- Comptador d'errors comesos.

### 7. Zoom overlay
- Overlay gairebé opac (`rgba(25,35,30,.94)`) a pantalla completa, nom + nom científic a dalt, botó tancar (X) circular, foto gran (fins 64vh/500px), peu amb instrucció per tornar.

### 8. Fail (error)
- Targeta vermella clara amb icona d'error circular, títol, cos, i requadre blanc amb l'espècie incorrecta a què s'ha arribat.
- Nota informativa (a quin pas es reprèn).
- Botó "Seguir intentant-ho".
- Animació de "shake" horitzontal en entrar.

### 9. Win (victòria)
- Icona check circular, títol, cos.
- Targeta amb foto de l'espècie objectiu, dades curioses (fet), i 3 mètriques (Temps / Passos / Errors).
- Si ha estat puntuable: targeta verda amb inicial+nom guardat + botó "Veure marcador".
- Llista del "camí correcte" seguit (etiquetes + text).
- Si acaba de guanyar el repte del llúpol: targeta de transició fosca oferint el repte extra dels carnívors (foto de la marta + CTA blanc).
- Targeta fosca (`#194836`) final amb logo WildKeys, missatge educatiu sobre claus dicotòmiques i CTA extern a wildkeys.io.
- Confeti animat en entrar a aquesta pantalla (partícules CSS, 90 peces, `wkfall` keyframes).

### 10. Board (classificació)
- Pestanyes Llúpol/Carnívors (només si hi ha puntuacions de carnívors).
- Files: rànquing (medalla d'or per al 1r), nom, etiqueta "demo"/"tu", errors, temps (monospace). Files demo predefinides barrejades amb les reals.
- Botó "Tornar a l'inici".

## Interactions & Behavior
- **Navegació:** basada en una única variable d'estat `screen` (`splash|home|play|fail|win|board`) sense router — tot en una sola pàgina/vista.
- **Cronòmetre:** `setInterval` cada 250ms actualitzant directament el DOM (ref) per evitar re-renders; es guarda `startedAt` per poder recuperar el temps transcorregut si es tanca l'app.
- **Un únic intent puntuable per mòbil**, controlat via `localStorage` (clau `wk_vilot_player_v1`). Un cop registrat, es reserva el jugador; els intents posteriors són "mode lliure" (no puntuable).
- **Recuperació d'intent:** si l'usuari tanca l'app a mitja partida puntuable, en tornar pot fer "Continuar el meu intent" (reprèn des de l'estat guardat, el cronòmetre continua des de `startedAt`).
- **Error/retrocés:** en triar una branca incorrecta, es retrocedeix automàticament fins a l'últim node que sí pertanyia al camí correcte (no cal tornar a l'inici).
- **Desfer pas:** el jugador pot desfer manualment l'últim pas triat sense penalització.
- **Transicions/animacions:** `wkrise` (fade+translateY en entrar seccions), `wkpop` (fade+scale per a modals), `wkshake` (error), `wkfall` (confeti), `wkping` (punt pulsant del rellotge/indicador en directe).
- **Idioma:** canvi instantani entre CA/ES/EN, tot el text ve d'un diccionari `T[lang]` (veure DATA_MODEL.md).
- **Persistència:** `localStorage` per rànquings, jugador i "welcome ja vist"; `sessionStorage` només per no repetir la splash a cada recàrrega dins la mateixa sessió.
- **Responsive:** disseny mòbil-only, `max-width:430px` centrat, pensat per usar-se sempre en un telèfon (no hi ha layout d'escriptori).

## State Management
Estat mínim necessari (un sol "store" per pantalla, sense backend):
```
lang: 'ca'|'es'|'en'
screen: 'splash'|'home'|'play'|'fail'|'win'|'board'
ch: 'hop'|'carn'                 // repte actiu
node: string                     // node actual de la clau
trail: {node, tag, text}[]       // camí recorregut
wrong: string|null               // espècie incorrecta (pantalla Fail)
fails: number
startedAt: number|null           // timestamp d'inici del cronòmetre
elapsed: number
hopBoard / carnBoard: {name, ms, fails, me?, demo?}[]
player: {nick, hopStartedAt, hopDone, hopMs, hopFails, carnStartedAt, carnDone, carnMs, carnFails} | null
nick, regOpen, regErr            // modal de registre
zoom: boolean
boardTab: 'hop'|'carn'
```
No cal backend: tot és local al dispositiu (adequat per a un esdeveniment puntual). Si es vol un rànquing global compartit entre dispositius, caldria afegir un backend/API mínim (no present en aquest prototip).

## Design Tokens
- **Tipografia:** `Merriweather` (serif, pesos 400/700, itàlica per a noms científics) per a títols i noms d'espècie; `Inter` (400–900) per a la resta de la interfície; `ui-monospace`/`Menlo` per a temps i comptadors.
- **Colors principals:**
  - Verd marca: `#278a5e` (accions primàries), hover `#216e4e`
  - Verd fosc: `#194836` (títols, targeta final), `#1d5740`
  - Verd clar/fons: `#e1f8e8`, `#f2fcf5`, `#c3efd2`
  - Verd accent/estat: `#5cc791`, `#36ab76`, `#94e0b3`
  - Groc LO VILOT: `#fbbf24`, avisos `#fffbeb`/`#fde68a`/`#92400e`/`#78350f`
  - Vermell error: `#dc2626`, `#fef2f2`, `#fca5a5`, `#991b1b`, `#7f1d1d`
  - Neutres: `#292524` (text), `#57534e`, `#78716c`, `#a8a29e`, `#e7e5e4`, `#fafaf9`
- **Radius:** targetes 14–24px, botons 12–16px, píndoles/avatars 999px (circular).
- **Ombres:** `0 6px 18px rgba(39,138,94,.28)` sobre botons verds primaris; `0 20px 60px rgba(0,0,0,.25)` en modals.
- **Alçada mínima de botons/inputs tocables:** 44–60px (objectiu tàctil mòbil).
- **Espaiat:** contenidor `max-width:430px`, padding lateral 16px, gaps interns de 6–22px segons jerarquia.

## Assets
- `assets/lovilot-logo.webp` — logotip circular de LO VILOT (marca amb corona d'espigues/llorer; és una imatge, no un component — el cercle "amb pinxos" ve dibuixat dins la pròpia imatge, no és un efecte CSS).
- `wk-logo.js` — logotip WildKeys (papallona), definit com a conjunt de paths SVG inline; component web `<wk-logo height="Npx">`.
- `image-slot.js` — placeholder d'imatge amb drag&drop (fotos del llúpol Vista i de la marta); en producció, substituir per les fotos reals dels espècimens.
- `assets/clave-carnivoros.pdf` — document font de la clau dicotòmica de carnívors (referència de contingut/dades).
- Fonts via Google Fonts: `Inter` i `Merriweather`.

## Data Model
Tota la clau dicotòmica (nodes, branques, espècies, noms científics) i el diccionari de traduccions CA/ES/EN estan documentats a `DATA_MODEL.md` — extreure'ls a JSON/fitxers de dades separats del codi de UI.

## Files
- `reference/WildKeys LO VILOT v3.dc.html` — disseny complet de l'aplicació (totes les pantalles, lògica d'estat i dades, en un sol fitxer HTML de referència).
- `reference/wk-logo.js`, `reference/image-slot.js` — components auxiliars usats pel disseny.
- `reference/assets/` — recursos gràfics i document font de la clau de carnívors.
- `DATA_MODEL.md` — extracció de les dades de joc (claus dicotòmiques + i18n) en format llegible.

Nota: el projecte de disseny original també conté un fitxer "vista mòbil" (marc de telèfon per previsualitzar) i una versió anterior "WildKeys Expedición" — no inclosos aquí perquè no formen part d'aquest joc; demaneu-los si els voleu com a referència addicional.
