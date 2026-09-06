import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

/** Parámetro que lleva la especie retratada: `?foto=vista`. */
const PARAM = 'foto';

export interface PhotoViewerControls {
  /** Especie que se está mirando, o `null` si el visor está cerrado. */
  readonly speciesId: string | null;
  open(speciesId: string): void;
  close(): void;
}

/**
 * Abre y cierra el visor de fotos.
 *
 * Va como parámetro de búsqueda y no como ruta propia para que la pantalla de
 * debajo **no se desmonte**: el visor se superpone, y al cerrarlo se sigue
 * exactamente donde se estaba, con la partida intacta.
 *
 * Al ser una entrada del historial, el botón atrás del móvil lo cierra — que es
 * lo que uno espera de un juego.
 */
export function usePhotoViewer(): PhotoViewerControls {
  const [params, setParams] = useSearchParams();

  const open = useCallback(
    (speciesId: string) => {
      const next = new URLSearchParams(params);
      next.set(PARAM, speciesId);
      setParams(next);
    },
    [params, setParams]
  );

  const close = useCallback(() => {
    const next = new URLSearchParams(params);
    next.delete(PARAM);
    setParams(next, { replace: true });
  }, [params, setParams]);

  return { speciesId: params.get(PARAM), open, close };
}
