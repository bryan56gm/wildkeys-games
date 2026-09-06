import { useCallback } from 'react';
import { useGameSession } from '../session-context';
import type { PhotoRef } from '../types';

/**
 * Devuelve la foto de una especie, o una referencia vacía si aún no la hay.
 *
 * Nunca falla por una foto ausente: la pantalla dibuja su marcador con el
 * texto alternativo, que es justo lo que permitió construir el juego entero
 * antes de tener las fotografías.
 */
export function useSpeciesPhoto(): (speciesId: string) => PhotoRef {
  const { definition } = useGameSession();

  return useCallback(
    (speciesId: string) => {
      const src = definition.speciesPhotos?.[speciesId];
      return src ? { src } : {};
    },
    [definition.speciesPhotos]
  );
}
