import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  compileKey,
  initialRun,
  runReducer,
  type CompiledKey,
  type RunEvent,
  type RunState,
} from '@wkg/game-engine';
import type { Translate } from '@wkg/i18n';
import type { Locale } from '@/app/i18n/locale';
import type { GameCopy } from './copy';
import { useGameCopy } from './hooks/use-game-copy';
import { usePersonalBests, type UsePersonalBestsResult } from './hooks/use-personal-bests';
import { usePlayer, type UsePlayerResult } from './hooks/use-player';
import { useLastResults, type UseLastResultsResult } from './hooks/use-last-results';
import { useSolvedPaths, type UseSolvedPathsResult } from './hooks/use-solved-paths';
import type { AnyGameDefinition, ChallengeDefinition } from './types';

/** Partida en curso. Vive en el layout, así que navegar no la destruye. */
export interface ActiveRun {
  readonly challenge: ChallengeDefinition<string>;
  readonly scored: boolean;
  readonly startedAt: number;
  /** Tiempo final una vez ganada; mientras es `null`, el reloj corre. */
  readonly finishedMs: number | null;
  readonly compiled: CompiledKey<Locale>;
  readonly state: RunState;
}

export interface GameSession {
  readonly definition: AnyGameDefinition;
  readonly t: Translate<GameCopy<string>>;
  readonly player: UsePlayerResult;
  /** Mejores tiempos en modo libre; nada que ver con la clasificación. */
  readonly bests: UsePersonalBestsResult;
  /** Recorridos ya resueltos, para repasarlos sin volver a jugar. */
  readonly paths: UseSolvedPathsResult;
  /** Resultado de la última partida ganada de cada reto. */
  readonly results: UseLastResultsResult;
  readonly activeRun: ActiveRun | null;
  /** Arranca una partida; si ya había una del mismo reto, la reemplaza. */
  begin(challenge: ChallengeDefinition<string>, scored: boolean, startedAt: number): void;
  /** Manda un evento al motor de la partida en curso. */
  dispatch(event: RunEvent): void;
  /** Congela el cronómetro al ganar. */
  freezeClock(elapsedMs: number): void;
  challengeById(id: string): ChallengeDefinition<string> | undefined;
  readonly mainChallenge: ChallengeDefinition<string>;
}

const Context = createContext<GameSession | null>(null);
Context.displayName = 'GameSessionContext';

/**
 * Estado del juego compartido por todas sus pantallas.
 *
 * Vive por encima del router a propósito: así retroceder desde el marcador —o
 * cerrar el zoom con el botón atrás— no aniquila la partida en curso, que era
 * el efecto de guardar el estado dentro de cada pantalla.
 */
export function GameSessionProvider({
  definition,
  children,
}: {
  definition: AnyGameDefinition;
  children: ReactNode;
}) {
  const t = useGameCopy(definition);
  const player = usePlayer(definition.slug);
  const bests = usePersonalBests(definition.slug);
  const paths = useSolvedPaths(definition.slug);
  const results = useLastResults(definition.slug);
  const [activeRun, setActiveRun] = useState<ActiveRun | null>(null);

  const begin = useCallback<GameSession['begin']>((challenge, scored, startedAt) => {
    const compiled = compileKey(challenge.key);
    setActiveRun({
      challenge,
      scored,
      startedAt,
      finishedMs: null,
      compiled,
      state: initialRun(compiled),
    });
  }, []);

  const dispatch = useCallback<GameSession['dispatch']>((event) => {
    setActiveRun((run) =>
      run ? { ...run, state: runReducer(run.compiled, run.state, event) } : run
    );
  }, []);

  const freezeClock = useCallback<GameSession['freezeClock']>((elapsedMs) => {
    setActiveRun((run) =>
      run && run.finishedMs === null ? { ...run, finishedMs: elapsedMs } : run
    );
  }, []);

  const challengeById = useCallback(
    (id: string) => definition.challenges.find((challenge) => challenge.id === id),
    [definition.challenges]
  );

  const main = definition.challenges[0];
  if (!main) throw new Error(`El juego "${definition.slug}" no declara ningún reto.`);

  const value = useMemo<GameSession>(
    () => ({
      definition,
      t,
      player,
      bests,
      paths,
      results,
      activeRun,
      begin,
      dispatch,
      freezeClock,
      challengeById,
      mainChallenge: main,
    }),
    [
      definition,
      t,
      player,
      bests,
      paths,
      results,
      activeRun,
      begin,
      dispatch,
      freezeClock,
      challengeById,
      main,
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useGameSession(): GameSession {
  const value = useContext(Context);
  if (!value) throw new Error('useGameSession() requiere estar dentro de <GameSessionProvider>.');
  return value;
}
