import { useEffect, useRef, useState } from 'react';
import {
  currentNode,
  currentStepLabel,
  progressRatio,
  reachableSpecies,
  resolveText,
  resolvedTrail,
  speciesById,
  speciesInPlay,
  targetSpecies,
} from '@wkg/game-engine';
import type { Translate } from '@wkg/i18n';
import { FALLBACK_LOCALE, type Locale } from '@/app/i18n/locale';
import { formatClock } from '@/lib/format/time';
import { BonusOffer } from './components/BonusOffer';
import { ZoomDialog } from './components/ZoomDialog';
import type { GameCopy } from './copy';
import { useBonusCopy, useChallengeCopy } from './hooks/use-game-copy';
import { useKeyRun } from './hooks/use-key-run';
import { FailScreen } from './screens/FailScreen';
import { PlayScreen } from './screens/PlayScreen';
import { WinScreen } from './screens/WinScreen';
import type { ChallengeDefinition, GameDefinition } from './types';

export interface ChallengeRunnerProps<C extends string> {
  definition: GameDefinition<C>;
  challenge: ChallengeDefinition<C>;
  t: Translate<GameCopy<C>>;
  locale: Locale;
  startedAt: number;
  /** El resultado cuenta para la clasificación. */
  scored: boolean;
  /** Nombre con el que se guardará la marca, si puntúa. */
  nickname: string | null;
  /** Aviso de sincronización que mostrar en la victoria. */
  syncNote?: string | undefined;
  /** Reto extra que ofrecer tras ganar este, si lo hay. */
  bonusChallenge?: ChallengeDefinition<C> | undefined;
  /** Se llama una vez al ganar, puntúe o no: congela el reloj y publica la marca. */
  onFinish(elapsedMs: number, fails: number): void;
  onStartBonus(challenge: ChallengeDefinition<C>): void;
  onPlayAgain(): void;
  onBoard(): void;
}

/**
 * Una partida completa a una clave: jugar, fallar y ganar.
 *
 * Se monta con `key={runId}` desde `GameApp`, así que empezar de nuevo es
 * remontar: no hay estado viejo que limpiar a mano.
 */
export function ChallengeRunner<C extends string>({
  definition,
  challenge,
  t,
  locale,
  startedAt,
  scored,
  nickname,
  syncNote,
  bonusChallenge,
  onFinish,
  onStartBonus,
  onPlayAgain,
  onBoard,
}: ChallengeRunnerProps<C>) {
  const { compiled, run, pick, undo, dismissFailure } = useKeyRun(challenge.key);
  const copy = useChallengeCopy(t, challenge.id);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [finishedMs, setFinishedMs] = useState<number | null>(null);
  const reported = useRef(false);

  // El tiempo se congela al ganar y se comunica una sola vez hacia arriba.
  useEffect(() => {
    if (run.status !== 'won' || reported.current) return;
    reported.current = true;
    const elapsed = Date.now() - startedAt;
    setFinishedMs(elapsed);
    onFinish(elapsed, run.fails);
  }, [run.status, run.fails, startedAt, onFinish]);

  const target = targetSpecies(compiled);
  const targetName = resolveText(target.name, locale, FALLBACK_LOCALE);
  const photoTarget = {
    photo: challenge.photo,
    photoLabel: copy.photoPlaceholder,
    name: targetName,
    scientificName: target.scientificName,
  };

  if (run.status === 'won') {
    return (
      <WinScreen
        copy={{
          title: copy.winTitle,
          body: copy.winBody,
          fact: copy.fact,
          timeLabel: t('timeLabel'),
          stepsLabel: t('stepsLabel'),
          failsLabel: t('failsLabelShort'),
          savedTitle: t('savedTitle'),
          seeBoard: t('seeBoard'),
          pathTitle: t('pathTitle'),
          boardLabel: t('boardLabel'),
          againLabel: t('againLabel'),
          outroTitle: t('wkTitle'),
          outroBody: t('wkBody'),
          outroCta: t('wkCta'),
          source: t('source'),
        }}
        locale={locale}
        target={photoTarget}
        stats={{ time: formatClock(finishedMs ?? 0), steps: run.trail.length, fails: run.fails }}
        savedAs={scored ? nickname : null}
        syncNote={syncNote}
        path={resolvedTrail(compiled, run)}
        outroHref={definition.externalCtaHref}
        bonus={
          bonusChallenge ? (
            <BonusPitch
              challenge={bonusChallenge}
              t={t}
              onAccept={() => onStartBonus(bonusChallenge)}
            />
          ) : undefined
        }
        onBoard={onBoard}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  if (run.status === 'failed' && run.wrongSpeciesId) {
    const wrong = speciesById(compiled, run.wrongSpeciesId);
    return (
      <FailScreen
        copy={{
          title: t('failTitle'),
          body: t('failBody'),
          youGot: t('youGot'),
          backToStep: t('backToStep'),
          resumeNote: t('resumeFmt', { n: currentStepLabel(compiled, run) }),
          retry: t('retryLabel'),
        }}
        wrong={{
          name: resolveText(wrong.name, locale, FALLBACK_LOCALE),
          scientificName: wrong.scientificName,
        }}
        onRetry={dismissFailure}
      />
    );
  }

  return (
    <>
      <PlayScreen
        copy={{
          yourTarget: t('yourTarget'),
          stepWord: t('stepWord'),
          zoomLabel: t('zoomLabel'),
          suspects: copy.suspects,
          remaining: copy.remaining(reachableSpecies(compiled, run.nodeId).length),
          trailTitle: t('trailTitle'),
          undo: t('backStep'),
          fails: run.fails > 0 ? t('failsFmt', { n: run.fails }) : null,
          progressLabel: t('keyLabel'),
        }}
        locale={locale}
        target={photoTarget}
        stepLabel={currentStepLabel(compiled, run)}
        progress={progressRatio(compiled, run)}
        species={speciesInPlay(compiled, run)}
        speciesColumns={challenge.speciesColumns}
        nodeTitle={resolveText(currentNode(compiled, run).title, locale, FALLBACK_LOCALE)}
        options={currentNode(compiled, run).options}
        trail={run.trail}
        onPick={pick}
        onUndo={undo}
        onZoom={() => setZoomOpen(true)}
      />

      <ZoomDialog
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        photo={challenge.photo}
        name={targetName}
        scientificName={target.scientificName}
        photoLabel={copy.photoPlaceholder}
        hint={t('zoomHint')}
        closeLabel={t('cancelLabel')}
      />
    </>
  );
}

/** Oferta del reto extra, con sus textos y su foto ya resueltos. */
function BonusPitch<C extends string>({
  challenge,
  t,
  onAccept,
}: {
  challenge: ChallengeDefinition<C>;
  t: Translate<GameCopy<C>>;
  onAccept(): void;
}) {
  const copy = useBonusCopy(t, challenge.id);
  const species = challenge.key.species[challenge.key.targetSpeciesId];

  return (
    <BonusOffer
      copy={copy}
      photo={challenge.photo}
      scientificName={species?.scientificName ?? ''}
      onAccept={onAccept}
    />
  );
}
