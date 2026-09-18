import type { LovilotCopy } from './types';

/**
 * Catalán — diccionario de referencia del juego. Los demás locales deben
 * declarar exactamente estas claves (lo comprueba el tipo `LovilotCopy`).
 */
export const ca = {
  collab: 'WildKeys × LO VILOT',
  homeTitle: 'Identifica el llúpol Vista tan ràpid com puguis',
  homeSub:
    'Tens davant 6 varietats de llúpol que es cultiven a LO VILOT. Recorre la clau dicotòmica i arriba fins a Vista sense equivocar-te.',
  homeFoot: 'Funciona sense connexió. Un intent puntuable per mòbil.',
  keyLabel: 'La clau que faràs servir',
  keyName: 'Clau dicotòmica de les varietats de llúpol de LO VILOT',
  keySpecies: '6 varietats · llúpol cultivat a LO VILOT',
  yourTarget: 'El teu objectiu',
  homeLabel: "Tornar a l'inici del joc",
  challengesLabel: 'Reptes disponibles',
  slideFmt: 'Repte {n} de {total}',
  exitLabel: 'Sortir',
  exitTitle: 'Vols sortir de la partida?',
  exitBodyFree: "Ets a mig repte. Si surts, aquest recorregut es perd i tornes a l'inici.",
  exitBodyScored:
    "Ets a mig intent puntuable i el cronòmetre no s'atura. El pots reprendre des de l'inici amb «Continuar el meu intent».",
  exitConfirm: 'Sortir igualment',
  exitStay: 'Continuar jugant',

  sponsorSubtitle: 'Especial LO VILOT · Cerveseria artesana de Lleida',
  sponsorDescription:
    'Cultiven les seves pròpies varietats de llúpol per elaborar cerveses amb caràcter local.',

  welcomeTitle: 'Benvingut/da al repte!',
  welcomeBody:
    'Tens davant teu 6 varietats de llúpol. Usa la clau dicotòmica per identificar la varietat Vista el més ràpid possible. Només tens un intent cronometrat!',
  welcomeNote:
    'Especial col·laboració amb LO VILOT, cerveseria artesana de Lleida que cultiva el seu propi llúpol.',
  welcomeBtn: 'Entesos, anem-hi!',

  regKicker: 'Abans de començar',
  regTitle: 'Tria el teu nom de jugador',
  regBody: 'Amb aquest nom apareixeràs a la classificació de l’esdeveniment.',
  regWarn:
    'El cronòmetre arrenca en registrar-te i l’intent queda reservat per a aquest mòbil. Només n’hi ha un.',
  regGo: 'Registrar-me i començar',
  nickPh: 'Ex. Equip Linx',
  cancelLabel: 'Ara no',
  errShort: 'Escriu com a mínim 2 caràcters.',
  errTaken: 'Aquest nom ja és a la classificació. Prova’n un altre.',

  startLabel: 'Començar el repte',
  boardLabel: 'Classificació',
  wildkeysLabel: 'Anar a WildKeys',
  retryUploadLabel: 'Pujar ara',
  againLabel: 'Jugar un altre cop',
  resumeRun: 'Continuar el meu intent',
  savedTitle: 'Desat com a',
  seeBoard: 'Veure marcador',
  rankFmt: 'Vas {n}.º de {total} a la classificació',
  usedPending: 'Tens un intent en marxa. El cronòmetre continua corrent.',
  replayLabel: 'Mode lliure',
  improveLabel: 'Millorar el temps',
  bestFmt: 'El teu millor temps lliure: {t}',
  newBestTitle: 'Nou rècord personal!',
  newBestBody:
    "Has batut el teu millor temps en mode lliure. No canvia la classificació de l'esdeveniment, però és teu.",
  scoredNote: 'Intent únic: compta per a la classificació.',
  replayNote: 'Ja superat. Pots millorar el teu temps, encara que ja no puntuï.',
  markFmt: 'La teva marca: {t}',
  lockedFmt: 'Es desbloqueja en identificar {name}.',
  progressFmt: '{n} de {total} reptes superats',

  stepWord: 'Pas',
  trailTitle: 'El teu recorregut',
  backStep: 'Desfer pas',
  zoomLabel: 'Ampliar',
  zoomHint: 'Toca la foto per ampliar-la. Toca fora per tornar.',
  failsFmt: 'Errors fins ara: {n}',

  failTitle: 'Oooh, has fallat!',
  failBody: 'Segueix intentant-ho. Aquesta branca de la clau porta a una altra varietat.',
  youGot: 'Has arribat a',
  backToStep: 'Tornes al pas',
  retryLabel: 'Seguir intentant-ho',
  resumeFmt: 'Reprens la clau al pas {n}, on et vas desviar.',

  timeLabel: 'Temps',
  stepsLabel: 'Passos',
  failsLabelShort: 'Errors',
  failsOneShort: '1 error',
  failsShortFmt: '{n} errors',
  pathTitle: 'El camí correcte',
  stepsFmt: '{n} passos',
  nextTitle: 'I ara què?',

  wkTitle: 'Acabes de fer servir una clau dicotòmica.',
  wkBody:
    'A cada pas tries entre dues o tres descripcions i avances fins a una única espècie. Això és exactament el que fa WildKeys, amb claus reals de fauna i flora.',
  wkCta: 'Conèixer WildKeys',
  source:
    'Claus dicotòmiques: Llúpol de LO VILOT i Carnívors terrestres d’Espanya (Esther Martínez Pujol, 2026, WildKeys).',

  boardTitle: 'Classificació',
  boardBody: 'Temps de tot l’esdeveniment, del més ràpid al més lent.',
  boardEmpty: 'Encara no hi ha temps desats. Sigues el primer.',
  backLabel: 'Tornar a l’inici',
  demoTag: 'demo',
  youTag: 'tu',
  youAreLabel: 'La teva posició',
  positionFmt: '{n}.º de {total}',
  findMeLabel: 'Veure la meva marca',
  boardOffline: 'Sense connexió: la classificació pot no estar actualitzada.',
  boardPending: 'La teva marca s’enviarà sola quan tornis a tenir connexió.',

  splashSub: 'Repte de la clau dicotòmica',
  splashLoading: 'Carregant…',

  'hop.name': 'Vista',
  'hop.caption': 'Varietat de llúpol de LO VILOT',
  'hop.headerSub': 'WildKeys × LO VILOT',
  'hop.winTitle': 'Felicitats, has identificat Vista!',
  'hop.winBody': 'Has recorregut la clau de llúpol de LO VILOT correctament.',
  'hop.fact':
    'Vista és una varietat de llúpol cultivada a LO VILOT. Es caracteritza per les bràctees obertes al moment de la collita i es cull fins a finals de setembre.',
  'hop.suspects': 'Varietats en joc',
  'hop.remainingFmt': 'En queden {n} de 6',
  'hop.photoPlaceholder': 'Foto del llúpol Vista',
  'hop.boardTab': 'Llúpol',
  'hop.boardKicker': 'Marcador · Llúpol',

  'carn.name': 'Marta',
  'carn.caption': 'Carnívor terrestre d’Espanya',
  'carn.headerSub': 'Repte carnívors',
  'carn.winTitle': 'Felicitats, has identificat la marta!',
  'carn.winBody': 'Has recorregut la clau de carnívors fins a Martes martes. Impressionant.',
  'carn.fact':
    'Passa gran part de la vida als arbres: pot saltar de branca en branca perseguint esquirols. Es distingeix de la fagina per la pitrera groguenca i compacta.',
  'carn.suspects': 'Espècies en joc',
  'carn.remainingFmt': 'En queden {n} de 16',
  'carn.photoPlaceholder': 'Foto de la marta',
  'carn.boardTab': 'Carnívors',
  'carn.boardKicker': 'Marcador · Carnívors',
  'carn.bonusKicker': 'Repte extra',
  'carn.bonusTitle': 'T’atreveixes a identificar el carnívor més difícil de Catalunya?',
  'carn.bonusSub':
    'La marta (Martes martes) s’amaga en una clau de 16 espècies de carnívors terrestres d’Espanya. El cronòmetre torna a zero.',
  'carn.bonusCta': 'Acceptar el repte',
} satisfies LovilotCopy;
