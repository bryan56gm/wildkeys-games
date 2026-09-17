import { createBrowserRouter } from 'react-router';
import { GameLayout } from '@/features/dichotomous-game/GameLayout';
import { BoardRoute } from '@/features/dichotomous-game/routes/BoardRoute';
import { HomeRoute } from '@/features/dichotomous-game/routes/HomeRoute';
import { PlayRoute } from '@/features/dichotomous-game/routes/PlayRoute';
import { ResultRoute } from '@/features/dichotomous-game/routes/ResultRoute';
import { gameRoutePatterns } from '@/features/dichotomous-game/routes/paths';
import { gameLoader, GameRouteFallback } from './routes/GameRoute';
import { PlatformHome } from './routes/PlatformHome';
import { NotFoundRoute, RouteError } from './routes/RouteError';

/**
 * Rutas de la plataforma.
 *
 * Un juego = `/{slug}`, y **cada pantalla suya tiene su propia URL**. Eso es lo
 * que hace que el botón «atrás» del móvil se comporte como en un juego: cierra
 * el zoom, sale del marcador, vuelve a la portada — en vez de abandonar la
 * aplicación, que es lo que ocurría con todo el juego en una sola dirección.
 *
 * Añadir un juego no toca este fichero: basta con registrarlo.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <PlatformHome />,
    errorElement: <RouteError />,
  },
  {
    path: '/:gameSlug',
    element: <GameLayout />,
    loader: gameLoader,
    HydrateFallback: GameRouteFallback,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <HomeRoute /> },
      { path: gameRoutePatterns.register, element: <HomeRoute registering /> },
      { path: gameRoutePatterns.play, element: <PlayRoute /> },
      { path: gameRoutePatterns.result, element: <ResultRoute /> },
      { path: gameRoutePatterns.board, element: <BoardRoute /> },
      { path: gameRoutePatterns.boardChallenge, element: <BoardRoute /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundRoute />,
  },
]);
