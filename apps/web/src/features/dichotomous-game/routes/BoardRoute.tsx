import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLeaderboard, useOfflineQueue } from '@wkg/leaderboard';
import { formatClock } from '@/lib/format/time';
import { rankedRows, visibleRows } from '../board-rows';
import { BoardScreen } from '../screens/BoardScreen';
import { useGameSession } from '../session-context';
import { gamePaths } from './paths';

/** Filas visibles: suficientes para la pantalla del evento. */
const MAX_ROWS = 12;

/**
 * Clasificación. El reto va en la URL, así que cambiar de pestaña es navegar:
 * el botón «atrás» devuelve a la pestaña anterior y luego a la portada.
 */
export function BoardRoute() {
  const { definition, t, mainChallenge } = useGameSession();
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const queue = useOfflineQueue();
  const slug = definition.slug;

  const active = definition.challenges.find((c) => c.id === challengeId)?.id ?? mainChallenge.id;
  const { entries, source } = useLeaderboard({
    gameSlug: slug,
    challenge: active,
    limit: MAX_ROWS,
  });

  const ranking = useMemo(
    () => rankedRows(entries, definition.demoScores ?? [], active),
    [entries, definition.demoScores, active]
  );
  const board = useMemo(() => visibleRows(ranking, MAX_ROWS), [ranking]);
  const mine = ranking.find((row) => row.mine);

  const hasPending = queue.pending.some((item) => item.gameSlug === slug);

  return (
    <BoardScreen
      copy={{
        kicker: t(`${active}.boardKicker`),
        title: t('boardTitle'),
        body: t('boardBody'),
        empty: t('boardEmpty'),
        back: t('backLabel'),
        youTag: t('youTag'),
        demoTag: t('demoTag'),
        tabsLabel: t('boardTitle'),
        retry: t('retryUploadLabel'),
        youAre: t('youAreLabel'),
        findMe: t('findMeLabel'),
        notice: notice(),
      }}
      tabs={definition.challenges.map((challenge) => ({
        value: challenge.id,
        label: t(`${challenge.id}.boardTab`),
      }))}
      activeTab={active}
      onTabChange={(value) => void navigate(gamePaths.board(slug, value), { replace: true })}
      rows={board.rows}
      mine={
        mine
          ? {
              position: t('positionFmt', { n: mine.rank, total: ranking.length }),
              time: formatClock(mine.elapsedMs),
            }
          : null
      }
      onRetry={hasPending ? queue.sync : undefined}
      retrying={queue.syncing}
      mineIsFarBelow={board.mineIsFarBelow}
      failsLabel={(fails) => (fails === 1 ? t('failsOneShort') : t('failsShortFmt', { n: fails }))}
      onBack={() => void navigate(gamePaths.home(slug))}
    />
  );

  /**
   * Aviso solo cuando pasa algo.
   *
   * Antes decía también la hora de la última actualización, y eso desconcierta
   * más de lo que informa: que la clasificación esté al día es lo normal, y
   * contarlo hace pensar que puede no estarlo. El marcador se refresca solo por
   * Realtime; si algo va mal, entonces sí se dice.
   */
  function notice(): string | null {
    if (hasPending) return t('boardPending');
    if (source === 'cached') return t('boardOffline');
    return null;
  }
}
