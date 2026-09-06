import { useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
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
import { FALLBACK_LOCALE } from '@/app/i18n/locale';
import { useLocale } from '@/app/i18n/locale';
import { formatClock } from '@/lib/format/time';
import { BonusOffer } from '../components/BonusOffer';
import { ZoomDialog } from '../components/ZoomDialog';
import { useBonusCopy, useChallengeCopy } from '../hooks/use-game-copy';
import { useFinishRun } from '../hooks/use-finish-run';
import { useSpeciesPhoto } from '../hooks/use-species-photo';
import { FailScreen } from '../screens/FailScreen';
import { PlayScreen } from '../screens/PlayScreen';
import { WinScreen } from '../screens/WinScreen';
import { useGameSession } from '../session-context';
import { gamePaths } from './paths';

/**
 * La partida: jugar, fallar y ganar. El estado vive en la sesión, no aquí, así
 * que ir al marcador y volver con «atrás» no la destruye.
 */
export function PlayRoute({ zoomed = false }: { zoomed?: boolean }) {
  const { challengeId = '' } = useParams();
  const { definition, t, player, activeRun, begin, dispatch, challengeById } = useGameSession();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { finish, queued } = useFinishRun();
  const photoOf = useSpeciesPhoto();
  const slug = definition.slug;

  // Entrar por la URL directamente (o recargar) arranca una partida libre.
  const challenge = challengeById(challengeId);
  const needsStart = !!challenge && activeRun?.challenge.id !== challengeId;
  useEffect(() => {
    if (needsStart && challenge) begin(challenge, false, Date.now());
  }, [begin, challenge, needsStart]);

  const copy = useChallengeCopy(t, challengeId || definition.challenges[0]!.id);
  const bonus = nextBonus();
  const bonusCopy = useBonusCopy(t, bonus?.id ?? challengeId);

  const status = activeRun?.state.status;
  useEffect(() => {
    if (!activeRun || status !== 'won') return;
    finish(Date.now() - activeRun.startedAt, activeRun.state.fails);
  }, [activeRun, finish, status]);

  if (!challenge) return <Navigate to={gamePaths.home(slug)} replace />;
  if (!activeRun || activeRun.challenge.id !== challengeId) return null;

  const { compiled, state } = activeRun;
  const target = targetSpecies(compiled);
  const targetName = resolveText(target.name, locale, FALLBACK_LOCALE);
  const photo = {
    photo: photoOf(compiled.key.targetSpeciesId),
    photoLabel: copy.photoPlaceholder,
    name: targetName,
    scientificName: target.scientificName,
  };

  if (state.status === 'won') {
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
        target={photo}
        stats={{
          time: formatClock(activeRun.finishedMs ?? 0),
          steps: state.trail.length,
          fails: state.fails,
        }}
        savedAs={activeRun.scored ? (player.player?.nickname ?? null) : null}
        syncNote={queued ? t('boardPending') : undefined}
        path={resolvedTrail(compiled, state)}
        outroHref={definition.externalCtaHref}
        bonus={
          bonus ? (
            <BonusOffer
              copy={bonusCopy}
              photo={photoOf(bonus.key.targetSpeciesId)}
              scientificName={bonus.key.species[bonus.key.targetSpeciesId]?.scientificName ?? ''}
              onAccept={() => startBonus(bonus)}
            />
          ) : undefined
        }
        onBoard={() => void navigate(gamePaths.board(slug, challengeId))}
        onPlayAgain={() => begin(challenge, false, Date.now())}
      />
    );
  }

  if (state.status === 'failed' && state.wrongSpeciesId) {
    const wrong = speciesById(compiled, state.wrongSpeciesId);
    return (
      <FailScreen
        wrongPhoto={photoOf(wrong.id)}
        copy={{
          title: t('failTitle'),
          body: t('failBody'),
          youGot: t('youGot'),
          backToStep: t('backToStep'),
          resumeNote: t('resumeFmt', { n: currentStepLabel(compiled, state) }),
          retry: t('retryLabel'),
        }}
        wrong={{
          name: resolveText(wrong.name, locale, FALLBACK_LOCALE),
          scientificName: wrong.scientificName,
        }}
        onRetry={() => dispatch({ type: 'DISMISS_FAILURE' })}
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
          remaining: copy.remaining(reachableSpecies(compiled, state.nodeId).length),
          trailTitle: t('trailTitle'),
          undo: t('backStep'),
          fails: state.fails > 0 ? t('failsFmt', { n: state.fails }) : null,
          progressLabel: t('keyLabel'),
        }}
        locale={locale}
        target={photo}
        stepLabel={currentStepLabel(compiled, state)}
        progress={progressRatio(compiled, state)}
        species={speciesInPlay(compiled, state)}
        speciesColumns={challenge.speciesColumns}
        nodeTitle={resolveText(currentNode(compiled, state).title, locale, FALLBACK_LOCALE)}
        options={currentNode(compiled, state).options}
        trail={state.trail}
        onPick={(optionIndex) => dispatch({ type: 'PICK', optionIndex })}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onZoom={() => void navigate(gamePaths.zoom(slug, challengeId))}
      />

      <ZoomDialog
        open={zoomed}
        onClose={() => void navigate(-1)}
        photo={photoOf(compiled.key.targetSpeciesId)}
        name={targetName}
        scientificName={target.scientificName}
        photoLabel={copy.photoPlaceholder}
        hint={t('zoomHint')}
        closeLabel={t('cancelLabel')}
      />
    </>
  );

  /** Siguiente reto marcado como extra tras el actual. */
  function nextBonus() {
    const index = definition.challenges.findIndex((item) => item.id === challengeId);
    return index < 0
      ? undefined
      : definition.challenges.slice(index + 1).find((item) => item.bonus);
  }

  function startBonus(next: NonNullable<ReturnType<typeof nextBonus>>) {
    const alreadyPlayed = player.player?.runs[next.id];
    if (player.player && !alreadyPlayed) {
      const record = player.startRun(next.id);
      begin(next, true, record?.runs[next.id]?.startedAt ?? Date.now());
    } else {
      begin(next, false, Date.now());
    }
    void navigate(gamePaths.play(slug, next.id));
  }
}
