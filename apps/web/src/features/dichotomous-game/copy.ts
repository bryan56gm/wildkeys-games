/**
 * Contrato de textos de un juego de clave dicotómica.
 *
 * Todo juego de la plataforma debe aportar un diccionario que satisfaga
 * `GameCopy<C>`, donde `C` es la unión de sus retos. TypeScript avisa de
 * cualquier texto que falte antes de que llegue a pantalla.
 */

/** Textos comunes a cualquier juego, independientes de sus retos. */
export interface CommonCopy {
  /** Cabecera y portada del juego. */
  collab: string;
  homeTitle: string;
  homeSub: string;
  homeFoot: string;
  keyLabel: string;
  keyName: string;
  keySpecies: string;
  yourTarget: string;

  /** Patrocinador o colaborador (opcional en la definición, obligatorio aquí
   *  para que el copy exista si el juego lo activa). */
  sponsorSubtitle: string;
  sponsorDescription: string;

  /** Bienvenida. */
  welcomeTitle: string;
  welcomeBody: string;
  welcomeNote: string;
  welcomeBtn: string;

  /** Registro. */
  regKicker: string;
  regTitle: string;
  regBody: string;
  regWarn: string;
  regGo: string;
  nickPh: string;
  cancelLabel: string;
  errShort: string;
  errTaken: string;

  /** Acciones de portada. */
  startLabel: string;
  freeLabel: string;
  boardLabel: string;
  againLabel: string;
  resumeRun: string;
  savedTitle: string;
  seeBoard: string;
  usedDoneFmt: string;
  usedPending: string;

  /** Partida. */
  stepWord: string;
  trailTitle: string;
  backStep: string;
  zoomLabel: string;
  zoomHint: string;
  failsFmt: string;

  /** Fallo. */
  failTitle: string;
  failBody: string;
  youGot: string;
  backToStep: string;
  retryLabel: string;
  resumeFmt: string;

  /** Victoria. */
  timeLabel: string;
  stepsLabel: string;
  failsLabelShort: string;
  failsOneShort: string;
  failsShortFmt: string;
  pathTitle: string;

  /** Cierre de marca. */
  wkTitle: string;
  wkBody: string;
  wkCta: string;
  source: string;

  /** Clasificación. */
  boardTitle: string;
  boardBody: string;
  boardEmpty: string;
  backLabel: string;
  demoTag: string;
  youTag: string;
  boardOffline: string;
  boardPending: string;
  boardSyncedFmt: string;

  /** Carga inicial. */
  splashSub: string;
  splashLoading: string;
}

/** Textos que cada reto declara, por convención `<reto>.<clave>`. */
export type ChallengeCopyKey =
  | 'name'
  /** Pie bajo el nombre del objetivo en la portada ("Variedad de lúpulo de LO VILOT"). */
  | 'caption'
  | 'headerSub'
  | 'winTitle'
  | 'winBody'
  | 'fact'
  | 'suspects'
  | 'remainingFmt'
  | 'photoPlaceholder'
  | 'boardTab'
  | 'boardKicker';

/**
 * Textos con los que se ofrece un reto extra al ganar el anterior. Solo los
 * necesitan los retos marcados `bonus`, de ahí que sean opcionales en el tipo;
 * `validateGameDefinition()` comprueba en desarrollo que no falte ninguno.
 */
export type BonusCopyKey = 'bonusKicker' | 'bonusTitle' | 'bonusSub' | 'bonusCta';

/** Textos de todos los retos de un juego. */
export type ChallengeCopy<C extends string> = {
  [K in `${C}.${ChallengeCopyKey}`]: string;
} & {
  [K in `${C}.${BonusCopyKey}`]?: string;
};

/** Diccionario completo de un juego. */
export type GameCopy<C extends string> = CommonCopy & ChallengeCopy<C>;
