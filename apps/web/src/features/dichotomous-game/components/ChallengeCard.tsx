import { useId, type ReactNode } from 'react';
import { Button, LockIcon, PlayIcon, StopwatchIcon } from '@wkg/ui';
import type { ChallengeStage } from '../hooks/use-challenge-board';
import type { PhotoRef } from '../types';
import { TargetCard } from './TargetCard';
import styles from './ChallengeCard.module.css';

export interface ChallengeCardCopy {
  kicker: string;
  name: string;
  caption: string;
  photoLabel: string;
  zoomLabel: string;
  /** Texto del botón. Un reto bloqueado lo muestra igual, apagado. */
  action: string;
  /** Estado bajo la identificación: la marca, el aviso o lo que lo desbloquea. */
  note: string;
  /** Tu mejor tiempo libre en este reto, si lo hay. */
  best?: string | null;
}

export interface ChallengeCardProps {
  copy: ChallengeCardCopy;
  photo: PhotoRef;
  stage: ChallengeStage;
  photoFit?: 'adaptive' | 'fixed';
  onViewPhoto(): void;
  onAction(): void;
}

/**
 * Un reto en la portada: qué es, en qué punto lo tienes y qué puedes hacer con
 * él ahora mismo.
 *
 * La acción vive aquí y no en una botonera común porque con más de un reto la
 * botonera miente: un «modo libre» suelto no dice de qué reto, y el mismo botón
 * no significa lo mismo para uno recién abierto que para uno ya competido.
 *
 * Un reto bloqueado enseña su botón igual, apagado: esconderlo deja la tarjeta
 * sin decir qué se puede hacer con ella. Apagado se ve que hay algo ahí y que
 * todavía no es tuyo, y la nota de al lado dice qué lo abre.
 */
export function ChallengeCard({
  copy,
  photo,
  stage,
  photoFit = 'fixed',
  onViewPhoto,
  onAction,
}: ChallengeCardProps) {
  const noteId = useId();
  const locked = stage === 'locked';

  return (
    <TargetCard
      photo={photo}
      photoLabel={copy.photoLabel}
      photoFit={photoFit}
      kicker={copy.kicker}
      name={copy.name}
      caption={copy.caption}
      layout="stacked"
      onZoom={locked ? undefined : onViewPhoto}
      zoomLabel={copy.zoomLabel}
      footer={
        <div className={styles.footer}>
          <span className={styles.note} data-stage={stage} id={noteId}>
            {locked ? <LockIcon size={13} /> : null}
            {copy.note}
          </span>
          {copy.best ? <span className={styles.best}>{copy.best}</span> : null}
          <Button
            variant={stage === 'done' ? 'outline' : 'primary'}
            size="sm"
            onClick={onAction}
            disabled={locked}
            leading={actionIcon(stage)}
            /*
             * Varios retos comparten el mismo texto de botón —«Empezar el
             * reto» en todos los que aún no has jugado—, y en pantalla los
             * distingue su tarjeta. Quien navega escuchando no ve la tarjeta:
             * el nombre del reto va en la etiqueta.
             */
            aria-label={`${copy.action}: ${copy.name}`}
            // El botón apagado no cuenta por qué lo está: lo cuenta la nota.
            aria-describedby={locked ? noteId : undefined}
          >
            {copy.action}
          </Button>
        </div>
      }
    />
  );
}

/** El icono dice de un vistazo qué clase de partida empieza el botón. */
function actionIcon(stage: ChallengeStage): ReactNode {
  if (stage === 'locked') return <LockIcon size={16} />;
  // Cronómetro y no flecha de repetir: lo que se juega ahí es el tiempo.
  if (stage === 'done') return <StopwatchIcon size={16} />;
  return <PlayIcon size={16} />;
}
