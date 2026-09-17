import { Navigate, useNavigate, useParams } from 'react-router';
import { compileKey, resolvedTrail, resolveText, targetSpecies } from '@wkg/game-engine';
import { useLeaderboard } from '@wkg/leaderboard';
import { FALLBACK_LOCALE, useLocale } from '@/app/i18n/locale';
import { formatClock } from '@/lib/format/time';
import { rankedRows } from '../board-rows';
import { BonusOffer } from '../components/BonusOffer';
import { useBonusCopy, useChallengeCopy } from '../hooks/use-game-copy';
import { usePhotoViewer } from '../hooks/use-photo-viewer';
import { useSpeciesPhoto } from '../hooks/use-species-photo';
import { WinScreen } from '../screens/WinScreen';
import { useGameSession } from '../session-context';
import { gamePaths } from './paths';

/**
 * El resultado de un reto ganado, en su propia URL.
 *
 * Tiene ruta propia —y no es la última pantalla de la partida— porque es lo
 * que permite recargar sin perderlo: antes el resultado vivía en memoria, y
 * recargar ahí devolvía al jugador a una partida nueva con el cronómetro en
 * marcha. Aquí se lee de lo guardado, así que aguanta la recarga, el botón
 * «atrás» y volver horas después.
 */
export function ResultRoute() {
  const { challengeId = '' } = useParams();
  const { definition, t, player, results, challengeById } = useGameSession();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const photoOf = useSpeciesPhoto();
  const viewer = usePhotoViewer();
  const slug = definition.slug;

  const challenge = challengeById(challengeId);
  const result = results.resultOf(challengeId);
  const copy = useChallengeCopy(t, challengeId || definition.challenges[0]!.id);
  const bonus = nextBonus();
  const bonusCopy = useBonusCopy(t, bonus?.id ?? challengeId);

  const { entries } = useLeaderboard({ gameSlug: slug, challenge: challengeId, limit: 100 });

  if (!challenge || !result) return <Navigate to={gamePaths.home(slug)} replace />;

  const compiled = compileKey(challenge.key);
  const target = targetSpecies(compiled);

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
        rank: myRank(),
        newBestTitle: t('newBestTitle'),
        newBestBody: t('newBestBody'),
        pathTitle: t('pathTitle'),
        pathNote: t('stepsFmt', { n: result.trail.length }),
        nextTitle: t('nextTitle'),
        boardLabel: t('boardLabel'),
        againLabel: t('againLabel'),
        homeLabel: t('backLabel'),
        outroTitle: t('wkTitle'),
        outroBody: t('wkBody'),
        outroCta: t('wkCta'),
        source: t('source'),
      }}
      locale={locale}
      target={{
        photo: photoOf(compiled.key.targetSpeciesId),
        photoLabel: copy.photoPlaceholder,
        name: resolveText(target.name, locale, FALLBACK_LOCALE),
        scientificName: target.scientificName,
      }}
      stats={{
        time: formatClock(result.elapsedMs),
        steps: result.trail.length,
        fails: result.fails,
      }}
      savedAs={result.scored ? (player.player?.nickname ?? null) : null}
      beatenBest={result.beatenBest}
      path={resolvedTrail(compiled, result.trail)}
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
      onViewPhoto={() => viewer.open(compiled.key.targetSpeciesId)}
      onBoard={() => void navigate(gamePaths.board(slug, challengeId))}
      onHome={() => void navigate(gamePaths.home(slug))}
      onPlayAgain={() => play(challengeId, false, Date.now())}
    />
  );

  /** En qué puesto va la marca propia, si llegó a la clasificación. */
  function myRank(): string | null {
    if (!result?.scored) return null;

    const rows = rankedRows(entries, definition.demoScores ?? [], challengeId);
    const mine = rows.find((row) => row.mine);
    return mine ? t('rankFmt', { n: mine.rank, total: rows.length }) : null;
  }

  /** Siguiente reto marcado como extra tras el actual. */
  function nextBonus() {
    const index = definition.challenges.findIndex((item) => item.id === challengeId);
    return index < 0
      ? undefined
      : definition.challenges.slice(index + 1).find((item) => item.bonus);
  }

  /** Acepta el reto extra. Puntúa si el jugador está registrado y no lo ha
   *  jugado aún; si no, es partida libre. */
  function startBonus(next: NonNullable<ReturnType<typeof nextBonus>>) {
    const scored = !!player.player && !player.player.runs[next.id];
    const started = scored ? player.startRun(next.id) : null;
    play(next.id, scored, started?.runs[next.id]?.startedAt ?? Date.now());
  }

  function play(id: string, scored: boolean, startedAt: number) {
    void navigate(gamePaths.play(slug, id), { state: { scored, startedAt } });
  }
}
