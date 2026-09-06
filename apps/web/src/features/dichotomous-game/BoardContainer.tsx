import { useMemo } from 'react';
import { useLeaderboard, useLeaderboardService } from '@wkg/leaderboard';
import type { Translate } from '@wkg/i18n';
import type { ScoreRowData } from './components/ScoreRow';
import type { GameCopy } from './copy';
import { BoardScreen } from './screens/BoardScreen';
import type { GameDefinition } from './types';

/** Filas visibles: suficientes para la pantalla del evento. */
const MAX_ROWS = 12;

export interface BoardContainerProps<C extends string> {
  definition: GameDefinition<C>;
  t: Translate<GameCopy<C>>;
  /** Reto cuya clasificación se está viendo. */
  activeChallengeId: C;
  onChallengeChange(challengeId: C): void;
  onBack(): void;
  /** Nombres de las pestañas, ya traducidos. */
  tabs: readonly { value: C; label: string }[];
  kicker: string;
}

/**
 * Conecta la clasificación con la pantalla. Toda la degradación sin red vive
 * aquí: snapshot cacheado, marcas en cola y avisos al jugador.
 */
export function BoardContainer<C extends string>({
  definition,
  t,
  activeChallengeId,
  onChallengeChange,
  onBack,
  tabs,
  kicker,
}: BoardContainerProps<C>) {
  const service = useLeaderboardService();
  const { entries, source, fetchedAt } = useLeaderboard({
    gameSlug: definition.slug,
    challenge: activeChallengeId,
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
      .filter((score) => score.challenge === activeChallengeId)
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
  }, [entries, definition.demoScores, activeChallengeId]);

  const hasPending = service.pending().some((item) => item.gameSlug === definition.slug);

  return (
    <BoardScreen
      copy={{
        kicker,
        title: t('boardTitle'),
        body: t('boardBody'),
        empty: t('boardEmpty'),
        back: t('backLabel'),
        youTag: t('youTag'),
        demoTag: t('demoTag'),
        tabsLabel: t('boardTitle'),
        notice: buildNotice(),
      }}
      tabs={tabs}
      activeTab={activeChallengeId}
      onTabChange={(value) => onChallengeChange(value as C)}
      rows={rows}
      failsLabel={(fails) => (fails === 1 ? t('failsOneShort') : t('failsShortFmt', { n: fails }))}
      onBack={onBack}
    />
  );

  function buildNotice(): string | null {
    if (hasPending) return t('boardPending');
    if (source === 'cached') return t('boardOffline');
    if (source === 'live' && fetchedAt)
      return t('boardSyncedFmt', { t: formatTimeOfDay(fetchedAt) });
    return null;
  }
}

function formatTimeOfDay(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}
