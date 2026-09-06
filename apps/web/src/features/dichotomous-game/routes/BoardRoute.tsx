import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useLeaderboard, useLeaderboardService } from '@wkg/leaderboard';
import type { ScoreRowData } from '../components/ScoreRow';
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
  const service = useLeaderboardService();
  const slug = definition.slug;

  const active = definition.challenges.find((c) => c.id === challengeId)?.id ?? mainChallenge.id;
  const { entries, source, fetchedAt } = useLeaderboard({
    gameSlug: slug,
    challenge: active,
    limit: MAX_ROWS,
  });

  const rows = useMemo<readonly ScoreRowData[]>(() => {
    const real = entries.map((entry) => ({
      name: entry.nickname,
      elapsedMs: entry.elapsedMs,
      fails: entry.fails,
      mine: entry.mine,
      demo: false,
    }));
    const demo = (definition.demoScores ?? [])
      .filter((score) => score.challenge === active)
      .map((score) => ({
        name: score.name,
        elapsedMs: score.elapsedMs,
        fails: score.fails,
        mine: false,
        demo: true,
      }));

    return [...real, ...demo]
      .sort((a, b) => a.elapsedMs - b.elapsedMs || a.fails - b.fails)
      .slice(0, MAX_ROWS)
      .map((row, index) => ({ ...row, rank: index + 1 }));
  }, [entries, definition.demoScores, active]);

  const hasPending = service.pending().some((item) => item.gameSlug === slug);

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
        notice: notice(),
      }}
      tabs={definition.challenges.map((challenge) => ({
        value: challenge.id,
        label: t(`${challenge.id}.boardTab`),
      }))}
      activeTab={active}
      onTabChange={(value) => void navigate(gamePaths.board(slug, value), { replace: true })}
      rows={rows}
      failsLabel={(fails) => (fails === 1 ? t('failsOneShort') : t('failsShortFmt', { n: fails }))}
      onBack={() => void navigate(gamePaths.home(slug))}
    />
  );

  function notice(): string | null {
    if (hasPending) return t('boardPending');
    if (source === 'cached') return t('boardOffline');
    if (source === 'live' && fetchedAt) {
      return t('boardSyncedFmt', {
        t: new Date(fetchedAt).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
    return null;
  }
}
