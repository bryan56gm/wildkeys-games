import type { LoaderFunctionArgs } from 'react-router';
import { validateGameDefinition, type AnyGameDefinition } from '@/features/dichotomous-game';
import { findGame } from '@/games/registry';

/**
 * Carga diferida del juego pedido en la ruta. El registro es la única fuente
 * de verdad: si el slug no está, la ruta responde 404 y el router pinta la
 * pantalla de error.
 *
 * Quien pinta el juego es `GameLayout` con sus rutas hijas; aquí solo se
 * resuelve y valida la definición.
 */
export async function gameLoader({ params }: LoaderFunctionArgs): Promise<AnyGameDefinition> {
  const entry = findGame(params['gameSlug']);
  if (!entry) throw new Response('Not found', { status: 404 });

  const definition = await entry.load();

  if (import.meta.env.DEV) {
    const issues = validateGameDefinition(definition);
    if (issues.length > 0) {
      throw new Error(
        `El juego "${definition.slug}" tiene contenido inválido:\n- ${issues.join('\n- ')}`
      );
    }
  }

  return definition;
}

/**
 * Lo que se ve mientras se descarga el chunk del juego. En la práctica dura un
 * instante (todo está precacheado), pero evita un salto en blanco.
 */
export function GameRouteFallback() {
  return <div aria-busy="true" />;
}
