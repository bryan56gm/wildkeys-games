import { createBrowserRouter } from 'react-router';
import { gameLoader, GameRoute, GameRouteFallback } from './routes/GameRoute';
import { PlatformHome } from './routes/PlatformHome';
import { NotFoundRoute, RouteError } from './routes/RouteError';

/**
 * Rutas de la plataforma.
 *
 * Un juego = una ruta `/{slug}`, resuelta contra `games/registry`. No hay nada
 * que tocar aquí al añadir juegos: basta con registrarlos.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <PlatformHome />,
    errorElement: <RouteError />,
  },
  {
    path: '/:gameSlug',
    element: <GameRoute />,
    loader: gameLoader,
    HydrateFallback: GameRouteFallback,
    errorElement: <RouteError />,
  },
  {
    path: '*',
    element: <NotFoundRoute />,
  },
]);
