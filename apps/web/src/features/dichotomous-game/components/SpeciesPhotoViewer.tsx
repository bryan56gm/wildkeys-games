import { resolveText } from '@wkg/game-engine';
import { PhotoViewer } from '@wkg/ui';
import { FALLBACK_LOCALE, useLocale } from '@/app/i18n/locale';
import { usePhotoViewer } from '../hooks/use-photo-viewer';
import { useGameSession } from '../session-context';

/**
 * Visor de la especie que indique la URL, sea cual sea la pantalla de debajo.
 *
 * Vive en el marco del juego y no en cada pantalla: así cualquier foto —la del
 * objetivo, la de la especie a la que te has equivocado, la del reto extra— se
 * amplía con el mismo gesto y el mismo comportamiento.
 */
export function SpeciesPhotoViewer() {
  const { definition, t } = useGameSession();
  const { locale } = useLocale();
  const { speciesId, close } = usePhotoViewer();

  if (!speciesId) return null;

  const species = definition.challenges
    .flatMap((challenge) => Object.values(challenge.key.species))
    .find((candidate) => candidate.id === speciesId);
  const src = definition.speciesPhotos?.[speciesId];

  // Una URL con una especie desconocida o sin foto no abre nada: se ignora.
  if (!species || !src) return null;

  return (
    <PhotoViewer
      // Cada especie estrena visor: así se abre siempre encajada.
      key={speciesId}
      open
      onClose={close}
      src={src}
      name={resolveText(species.name, locale, FALLBACK_LOCALE)}
      caption={species.scientificName}
      closeLabel={t('cancelLabel')}
      hint={t('zoomHint')}
    />
  );
}
