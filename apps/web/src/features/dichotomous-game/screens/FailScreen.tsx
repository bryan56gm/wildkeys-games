import { Button, Card, Kicker } from '@wkg/ui';
import { PhotoSlot } from '../components/PhotoSlot';
import type { PhotoRef } from '../types';
import styles from './FailScreen.module.css';

export interface FailScreenProps {
  copy: {
    title: string;
    body: string;
    youGot: string;
    backToStep: string;
    resumeNote: string;
    retry: string;
  };
  wrong: { name: string; scientificName: string };
  /** Foto de la especie equivocada: verla es media lección. */
  wrongPhoto?: PhotoRef;
  /** Amplía la foto a pantalla completa. */
  onViewPhoto?: () => void;
  onRetry(): void;
}

/** Rama equivocada: qué especie salió y a qué paso se vuelve. */
export function FailScreen({ copy, wrong, wrongPhoto, onViewPhoto, onRetry }: FailScreenProps) {
  return (
    <section className={`${styles.screen} wk-anim-shake`}>
      <Card tone="danger" className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          <svg
            width="27"
            height="27"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.3"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </span>
        <h2 className={styles.title}>{copy.title}</h2>
        <p className={styles.body}>{copy.body}</p>

        <div className={styles.wrong}>
          {wrongPhoto?.src ? (
            <button type="button" className={styles.wrongPhoto} onClick={onViewPhoto}>
              <PhotoSlot photo={wrongPhoto} label={wrong.name} maxHeight={120} />
            </button>
          ) : null}
          <Kicker tone="danger">{copy.youGot}</Kicker>
          <span className={styles.wrongName}>{wrong.name}</span>
          <span className={styles.wrongSci}>{wrong.scientificName}</span>
        </div>
      </Card>

      <Card className={styles.resume}>
        <Kicker>{copy.backToStep}</Kicker>
        <span className={styles.resumeText}>{copy.resumeNote}</span>
      </Card>

      <Button size="lg" onClick={onRetry}>
        {copy.retry}
      </Button>
    </section>
  );
}
