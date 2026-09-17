import { useCallback, useState } from 'react';
import { useMatch, useNavigate } from 'react-router';
import { gamePaths, gameRoutePatterns } from '../routes/paths';
import { useGameSession } from '../session-context';

export interface UseExitRunResult {
  /** Hay una partida que se perdería al salir. */
  readonly hasRun: boolean;
  /** El intento en curso puntúa: el aviso es más serio. */
  readonly scored: boolean;
  readonly confirming: boolean;
  /** Pide salir: pregunta si hay partida, sale directo si no la hay. */
  requestExit(): void;
  /** Sale de verdad y vuelve a la portada. */
  exit(): void;
  /** Cierra el aviso y sigue jugando. */
  stay(): void;
}

/**
 * Salir de la partida y volver a la portada, desde el logo o desde el botón de
 * salida. Abandonar no borra el intento puntuable: el cronómetro del evento
 * sigue corriendo y el jugador lo retoma con «Continuar mi intento» — de ahí
 * que en clasificatoria se avise antes.
 *
 * Salir SOLO navega. Descartar aquí la partida la resucitaba: `PlayRoute`
 * seguía montada un render más, veía que no había partida para su URL y
 * arrancaba una libre — con lo que el reloj seguía corriendo en la portada y
 * había que volver a pulsar «salir». Quien empieza una partida es quien
 * reemplaza la anterior, y nadie más.
 */
export function useExitRun(): UseExitRunResult {
  const { definition, activeRun } = useGameSession();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  // Solo hay algo que perder jugando: fuera de la partida —o ya ganada— la
  // marca lleva a la portada sin preguntar nada.
  const playing = !!useMatch(`/:gameSlug/${gameRoutePatterns.play}`);
  const hasRun = playing && !!activeRun && activeRun.state.status !== 'won';
  const scored = !!activeRun?.scored;

  const exit = useCallback(() => {
    setConfirming(false);
    void navigate(gamePaths.home(definition.slug));
  }, [definition.slug, navigate]);

  const requestExit = useCallback(() => {
    if (hasRun) return setConfirming(true);
    exit();
  }, [exit, hasRun]);

  return {
    hasRun,
    scored,
    confirming,
    requestExit,
    exit,
    stay: useCallback(() => setConfirming(false), []),
  };
}
