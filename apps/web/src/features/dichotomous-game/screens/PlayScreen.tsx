import type { KeyOption, SpeciesInPlay, TrailStep } from '@wkg/game-engine';
import { ProgressBar } from '@wkg/ui';
import type { Locale } from '@/app/i18n/locale';
import { DecisionList } from '../components/DecisionList';
import { SpeciesGrid } from '../components/SpeciesGrid';
import { TargetCard } from '../components/TargetCard';
import { TrailStrip } from '../components/TrailStrip';
import type { PhotoRef } from '../types';
import styles from './PlayScreen.module.css';

export interface PlayScreenCopy {
  yourTarget: string;
  stepWord: string;
  zoomLabel: string;
  suspects: string;
  remaining: string;
  trailTitle: string;
  undo: string;
  fails: string | null;
  progressLabel: string;
}

export interface PlayScreenProps {
  copy: PlayScreenCopy;
  locale: Locale;
  target: { photo: PhotoRef; photoLabel: string; name: string; scientificName: string };
  stepLabel: string;
  progress: number;
  species: readonly SpeciesInPlay<Locale>[];
  speciesColumns: number;
  nodeTitle: string;
  options: readonly KeyOption<Locale>[];
  trail: readonly TrailStep[];
  onPick(optionIndex: number): void;
  onUndo(): void;
  onZoom(): void;
}

/** Pantalla de juego: objetivo, candidatas, decisión y recorrido. */
export function PlayScreen({
  copy,
  locale,
  target,
  stepLabel,
  progress,
  species,
  speciesColumns,
  nodeTitle,
  options,
  trail,
  onPick,
  onUndo,
  onZoom,
}: PlayScreenProps) {
  return (
    <section className={styles.screen}>
      <TargetCard
        photo={target.photo}
        photoLabel={target.photoLabel}
        photoHeight={160}
        kicker={copy.yourTarget}
        name={target.name}
        caption={target.scientificName}
        onZoom={onZoom}
        zoomLabel={copy.zoomLabel}
        aside={{ label: copy.stepWord, value: stepLabel }}
      />

      <ProgressBar value={progress} label={copy.progressLabel} />

      <section className={styles.suspects}>
        <div className={styles.suspectsHead}>
          <span className={styles.sectionLabel}>{copy.suspects}</span>
          <span className={styles.remaining}>{copy.remaining}</span>
        </div>
        <SpeciesGrid
          species={species}
          locale={locale}
          columns={speciesColumns}
          label={copy.suspects}
        />
      </section>

      <section className={styles.decision} key={nodeTitle}>
        <span className={styles.sectionLabel}>{nodeTitle}</span>
        <DecisionList options={options} locale={locale} onPick={onPick} />
      </section>

      <TrailStrip trail={trail} title={copy.trailTitle} undoLabel={copy.undo} onUndo={onUndo} />

      {copy.fails ? <p className={styles.fails}>{copy.fails}</p> : null}
    </section>
  );
}
