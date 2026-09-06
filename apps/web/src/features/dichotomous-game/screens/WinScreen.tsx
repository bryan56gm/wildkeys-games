import type { ResolvedStep } from '@wkg/game-engine';
import { resolveText } from '@wkg/game-engine';
import { Avatar, Button, Card, Confetti, Kicker, Stat } from '@wkg/ui';
import { FALLBACK_LOCALE, type Locale } from '@/app/i18n/locale';
import { BrandOutro } from '../components/BrandOutro';
import { PhotoSlot } from '../components/PhotoSlot';
import type { PhotoRef } from '../types';
import styles from './WinScreen.module.css';
import type { ReactNode } from 'react';

export interface WinScreenCopy {
  title: string;
  body: string;
  fact: string;
  timeLabel: string;
  stepsLabel: string;
  failsLabel: string;
  savedTitle: string;
  seeBoard: string;
  pathTitle: string;
  boardLabel: string;
  againLabel: string;
  outroTitle: string;
  outroBody: string;
  outroCta: string;
  source: string;
}

export interface WinScreenProps {
  copy: WinScreenCopy;
  locale: Locale;
  target: { photo: PhotoRef; photoLabel: string; name: string; scientificName: string };
  stats: { time: string; steps: number; fails: number };
  /** Nombre con el que se guardó la marca; `null` si la partida no puntuaba. */
  savedAs: string | null;
  /** Aviso de sincronización (marca en cola, sin conexión…). */
  syncNote?: string | undefined;
  path: readonly ResolvedStep<Locale>[];
  outroHref: string;
  /** Oferta del reto extra, si toca. */
  bonus?: ReactNode;
  /** Amplía la foto a pantalla completa. */
  onViewPhoto?: () => void;
  onBoard(): void;
  onPlayAgain(): void;
}

/** Victoria: métricas, camino correcto, reto extra y cierre de marca. */
export function WinScreen({
  copy,
  locale,
  target,
  stats,
  savedAs,
  syncNote,
  path,
  outroHref,
  bonus,
  onViewPhoto,
  onBoard,
  onPlayAgain,
}: WinScreenProps) {
  return (
    <section className={`${styles.screen} wk-anim-pop`}>
      <Confetti />

      <header className={styles.head}>
        <span className={styles.icon} aria-hidden="true">
          <svg
            width="29"
            height="29"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </span>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.body}>{copy.body}</p>
      </header>

      <Card tone="brand" flush>
        <button type="button" className={styles.photoButton} onClick={onViewPhoto}>
          <PhotoSlot photo={target.photo} label={target.photoLabel} maxHeight={160} />
        </button>
        <div className={styles.summary}>
          <div className={styles.names}>
            <span className={styles.name}>{target.name}</span>
            <span className={styles.sci}>{target.scientificName}</span>
          </div>
          <p className={styles.fact}>{copy.fact}</p>
          <div className={styles.stats}>
            <Stat label={copy.timeLabel} value={stats.time} />
            <Stat label={copy.stepsLabel} value={stats.steps} />
            <Stat label={copy.failsLabel} value={stats.fails} />
          </div>
        </div>
      </Card>

      {savedAs ? (
        <Card tone="brand" className={styles.saved}>
          <Avatar name={savedAs} tone="solid" />
          <div className={styles.savedText}>
            <Kicker tone="brand">{copy.savedTitle}</Kicker>
            <span className={styles.savedName}>{savedAs}</span>
            {syncNote ? <span className={styles.syncNote}>{syncNote}</span> : null}
          </div>
          <Button
            variant="outline"
            size="sm"
            block={false}
            onClick={onBoard}
            className={styles.savedAction}
          >
            {copy.seeBoard}
          </Button>
        </Card>
      ) : null}

      <section className={styles.path}>
        <Kicker>{copy.pathTitle}</Kicker>
        <ol className={styles.pathList}>
          {path.map(({ step, option }, index) => (
            <li key={`${step.nodeId}-${index}`} className={styles.pathItem}>
              <span className={styles.pathTag}>{option.tag}</span>
              <span className={styles.pathText}>
                {resolveText(option.text, locale, FALLBACK_LOCALE)}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {bonus}

      <BrandOutro
        title={copy.outroTitle}
        body={copy.outroBody}
        cta={copy.outroCta}
        href={outroHref}
      />

      <div className={styles.actions}>
        <Button variant="outline" size="sm" onClick={onBoard}>
          {copy.boardLabel}
        </Button>
        <Button variant="neutral" size="sm" onClick={onPlayAgain}>
          {copy.againLabel}
        </Button>
      </div>

      <p className={styles.source}>{copy.source}</p>
    </section>
  );
}
