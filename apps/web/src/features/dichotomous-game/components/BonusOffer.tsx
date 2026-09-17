import { Button, Kicker, PlayIcon } from '@wkg/ui';
import type { BonusCopy } from '../hooks/use-game-copy';
import type { PhotoRef } from '../types';
import { PhotoSlot } from './PhotoSlot';
import styles from './BonusOffer.module.css';

export interface BonusOfferProps {
  copy: BonusCopy;
  photo: PhotoRef;
  scientificName: string;
  onAccept(): void;
}

/** Oferta del reto extra al ganar el reto anterior. */
export function BonusOffer({ copy, photo, scientificName, onAccept }: BonusOfferProps) {
  return (
    <section className={styles.card}>
      <Kicker tone="onDark">{copy.kicker}</Kicker>
      <h3 className={styles.title}>{copy.title}</h3>
      <p className={styles.subtitle}>{copy.subtitle}</p>

      <div className={styles.preview}>
        <PhotoSlot photo={photo} label={copy.photoPlaceholder} maxHeight={120} />
        <div className={styles.previewNames}>
          <span className={styles.previewName}>{copy.name}</span>
          <span className={styles.previewSci}>{scientificName}</span>
        </div>
      </div>

      <Button variant="inverse" onClick={onAccept} leading={<PlayIcon size={16} />}>
        {copy.cta}
      </Button>
    </section>
  );
}
