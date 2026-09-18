import type { ResolvedStep } from '@wkg/game-engine';
import {
  Avatar,
  Button,
  Card,
  Confetti,
  Disclosure,
  HomeIcon,
  Kicker,
  ReplayIcon,
  RichText,
  Stat,
  StopwatchIcon,
  TrophyIcon,
} from '@wkg/ui';
import type { Locale } from '@/app/i18n/locale';
import { BrandOutro } from '../components/BrandOutro';
import { PhotoSlot } from '../components/PhotoSlot';
import { SolvedPath } from '../components/SolvedPath';
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
  /** «Vas 3.º de 14», una vez guardada la marca. */
  rank: string | null;
  /** Título y cuerpo del récord personal, si esta partida lo ha batido. */
  newBestTitle: string;
  newBestBody: string;
  pathTitle: string;
  /** «6 pasos», al lado del título del recorrido plegado. */
  pathNote: string;
  /** Encabeza las salidas: «¿Y ahora qué?». */
  nextTitle: string;
  boardLabel: string;
  againLabel: string;
  homeLabel: string;
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
  /** La partida libre ha batido el récord personal. */
  beatenBest?: boolean;
  path: readonly ResolvedStep<Locale>[];
  outroHref: string;
  /** Oferta del reto extra, si toca. */
  bonus?: ReactNode;
  /** Amplía la foto a pantalla completa. */
  onViewPhoto?: () => void;
  onBoard(): void;
  onPlayAgain(): void;
  onHome(): void;
}

/**
 * Final de reto: qué has hecho, qué puedes hacer ahora, y el detalle aparte.
 *
 * El orden es el que necesita alguien que acaba de terminar y aún tiene el
 * móvil en la mano en medio de un evento: primero su marca, después **las
 * salidas** —seguir con el reto extra, ver la clasificación, volver al
 * inicio—, y solo entonces el detalle, plegado. El recorrido paso a paso
 * interesa a quien lo busca; puesto por delante, entierra lo que la mayoría
 * viene a hacer y satura justo cuando hay que decidir.
 */
export function WinScreen({
  copy,
  locale,
  target,
  stats,
  savedAs,
  syncNote,
  beatenBest = false,
  path,
  outroHref,
  bonus,
  onViewPhoto,
  onBoard,
  onPlayAgain,
  onHome,
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
        <h1 className={styles.title}>
          <RichText text={copy.title} />
        </h1>
        <p className={styles.body}>
          <RichText text={copy.body} />
        </p>
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
          <p className={styles.fact}>
            <RichText text={copy.fact} />
          </p>
          <div className={styles.stats}>
            <Stat label={copy.timeLabel} value={stats.time} />
            <Stat label={copy.stepsLabel} value={stats.steps} />
            <Stat label={copy.failsLabel} value={stats.fails} />
          </div>
        </div>
      </Card>

      {beatenBest ? (
        <Card tone="accent" className={styles.best}>
          <span className={styles.bestIcon} aria-hidden="true">
            <StopwatchIcon size={20} />
          </span>
          <div className={styles.bestText}>
            <span className={styles.bestTitle}>{copy.newBestTitle}</span>
            <span className={styles.bestBody}>{copy.newBestBody}</span>
          </div>
        </Card>
      ) : null}

      {savedAs ? (
        <Card tone="brand" className={styles.saved}>
          <Avatar name={savedAs} tone="solid" />
          <div className={styles.savedText}>
            <Kicker tone="brand">{copy.savedTitle}</Kicker>
            <span className={styles.savedName}>{savedAs}</span>
            {copy.rank ? <span className={styles.rank}>{copy.rank}</span> : null}
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

      <section className={styles.next}>
        <Kicker>{copy.nextTitle}</Kicker>
        {/* El reto extra es la salida destacada cuando existe: es lo que
            continúa la partida. Las demás siempre están, en su tono. */}
        {bonus}
        <Button variant="outline" onClick={onBoard} leading={<TrophyIcon size={17} />}>
          {copy.boardLabel}
        </Button>
        <div className={styles.secondary}>
          <Button variant="neutral" size="sm" onClick={onHome} leading={<HomeIcon size={16} />}>
            {copy.homeLabel}
          </Button>
          <Button
            variant="neutral"
            size="sm"
            onClick={onPlayAgain}
            leading={<ReplayIcon size={16} />}
          >
            {copy.againLabel}
          </Button>
        </div>
      </section>

      {/* Abierto de entrada: aquí el recorrido no es letra pequeña, es lo que
          el jugador enseña a los demás y con lo que repasa la clave. Plegado
          pasaba desapercibido. */}
      <Disclosure summary={copy.pathTitle} note={copy.pathNote} defaultOpen>
        <SolvedPath path={path} locale={locale} />
      </Disclosure>

      <BrandOutro
        title={copy.outroTitle}
        body={copy.outroBody}
        cta={copy.outroCta}
        href={outroHref}
      />

      <p className={styles.source}>{copy.source}</p>
    </section>
  );
}
