import { render, screen, type RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import {
  compileKey,
  currentNode,
  initialRun,
  reachableSpecies,
  runReducer,
  type DichotomousKey,
} from '@wkg/game-engine';
import type { Locale } from '@/app/i18n/locale';
import { GameLayout } from '@/features/dichotomous-game/GameLayout';
import { BoardRoute } from '@/features/dichotomous-game/routes/BoardRoute';
import { HomeRoute } from '@/features/dichotomous-game/routes/HomeRoute';
import { PlayRoute } from '@/features/dichotomous-game/routes/PlayRoute';
import { ResultRoute } from '@/features/dichotomous-game/routes/ResultRoute';
import { gameRoutePatterns } from '@/features/dichotomous-game/routes/paths';
import { AppProviders } from '@/app/providers/AppProviders';
import { lovilotGame } from '@/games/lovilot';

/**
 * Monta el juego real con el router real.
 *
 * Se usa el juego de verdad y no un doble: los fallos que han llegado al móvil
 * estaban en las costuras entre ruta, sesión y jugador, y un juego de mentira
 * con dos nodos no las recorre igual.
 */
export function renderGame(path = `/${lovilotGame.slug}`): RenderResult & {
  router: ReturnType<typeof createMemoryRouter>;
} {
  skipIntros();

  const router = createMemoryRouter(
    [
      {
        path: '/:gameSlug',
        element: <GameLayout />,
        loader: () => lovilotGame,
        children: [
          { index: true, element: <HomeRoute /> },
          { path: gameRoutePatterns.register, element: <HomeRoute registering /> },
          { path: gameRoutePatterns.play, element: <PlayRoute /> },
          { path: gameRoutePatterns.result, element: <ResultRoute /> },
          { path: gameRoutePatterns.board, element: <BoardRoute /> },
          { path: gameRoutePatterns.boardChallenge, element: <BoardRoute /> },
        ],
      },
    ],
    { initialEntries: [path] }
  );

  return {
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    ),
    router,
  };
}

/**
 * La carga y la bienvenida ya vistas: ningún test empieza por ahí. Y el idioma
 * fijado, para que los textos esperados no dependan de la configuración de la
 * máquina que corre los tests.
 */
function skipIntros() {
  window.localStorage.setItem('wk.locale', 'es');
  window.sessionStorage.setItem(`wk.${lovilotGame.slug}.splash`, '1');
  window.localStorage.setItem(`wk.${lovilotGame.slug}.welcome`, '1');
}

/** Deja al jugador registrado, y opcionalmente con el reto ya completado. */
export function givenPlayer(nickname: string, completed: readonly string[] = []) {
  const runs = Object.fromEntries(
    completed.map((challenge) => [
      challenge,
      { startedAt: Date.now() - 60_000, completed: true, elapsedMs: 60_000, fails: 0 },
    ])
  );
  window.localStorage.setItem(`wk.${lovilotGame.slug}.player`, JSON.stringify({ nickname, runs }));
}

/**
 * Juega la partida abierta hasta ganarla.
 *
 * El camino correcto no se declara: se deriva del árbol con el propio motor
 * —la misma invariante que cumple el juego— y luego se pulsa en pantalla la
 * rama que toca en cada paso.
 */
export async function winOpenChallenge(key: DichotomousKey<Locale>) {
  for (const tag of correctTags(key)) {
    await userEvent.click(await screen.findByRole('button', { name: new RegExp(`^${tag}\\b`) }));
  }
}

function correctTags(key: DichotomousKey<Locale>): readonly string[] {
  const compiled = compileKey(key);
  const tags: string[] = [];
  let state = initialRun(compiled);

  while (state.status === 'playing') {
    const options = currentNode(compiled, state).options;
    const index = options.findIndex((option) =>
      option.to.kind === 'species'
        ? option.to.speciesId === key.targetSpeciesId
        : reachableSpecies(compiled, option.to.nodeId).includes(key.targetSpeciesId)
    );
    if (index < 0) throw new Error(`La clave "${key.id}" no llega a su objetivo.`);

    tags.push(options[index]!.tag);
    state = runReducer(compiled, state, { type: 'PICK', optionIndex: index });
  }

  return tags;
}
