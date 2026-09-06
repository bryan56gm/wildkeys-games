import { useCallback, useMemo, useState } from 'react';
import { useOfflineQueue, useSubmitScore } from '@wkg/leaderboard';
import { useLocale } from '@/app/i18n/locale';
import { formatClock } from '@/lib/format/time';
import { ChallengeRunner } from './ChallengeRunner';
import { BoardContainer } from './BoardContainer';
import { GameHeader } from './components/GameHeader';
import { RegistrationDialog } from './components/RegistrationDialog';
import { WelcomeDialog } from './components/WelcomeDialog';
import { useChallengeCopy, useGameCopy } from './hooks/use-game-copy';
import { useOnceFlag } from './hooks/use-once-flags';
import { usePlayer } from './hooks/use-player';
import { useNicknameTaken } from './hooks/use-taken-nicknames';
import { HomeScreen } from './screens/HomeScreen';
import { SplashScreen } from './screens/SplashScreen';
import type { ChallengeDefinition, GameDefinition } from './types';
import styles from './GameApp.module.css';

const DEFAULT_SPLASH_MS = 8_200;

/** Partida en curso: qué reto, si puntúa y desde cuándo corre el cronómetro. */
interface ActiveRun<C extends string> {
  readonly challenge: ChallengeDefinition<C>;
  readonly scored: boolean;
  readonly startedAt: number;
  /** Tiempo final una vez ganado; mientras es `null`, el reloj corre. */
  readonly finishedMs: number | null;
  /** Cambia en cada arranque para remontar el runner y empezar limpio. */
  readonly runId: number;
}

/**
 * Plantilla de juego de clave dicotómica.
 *
 * Orquesta pantallas, registro del jugador y envío de marcas; el contenido lo
 * pone la `GameDefinition` que recibe. Añadir un juego nuevo no toca este
 * fichero.
 */
export function GameApp<C extends string>({ definition }: { definition: GameDefinition<C> }) {
  const { locale } = useLocale();
  const t = useGameCopy(definition);
  const splash = useOnceFlag(definition.slug, 'splash', 'session');
  const welcome = useOnceFlag(definition.slug, 'welcome', 'local');
  const { player, register, startRun, completeRun, pendingChallengeId } = usePlayer(
    definition.slug
  );
  const isNicknameTaken = useNicknameTaken(definition);
  const { submit, lastOutcome } = useSubmitScore();
  useOfflineQueue(); // vacía la cola en cuanto vuelve la conexión

  const [view, setView] = useState<'home' | 'board'>('home');
  const [active, setActive] = useState<ActiveRun<C> | null>(null);
  const [registering, setRegistering] = useState(false);
  const [boardChallengeId, setBoardChallengeId] = useState<C>(() => mainChallenge(definition).id);

  const main = mainChallenge(definition);
  const mainCopy = useChallengeCopy(t, main.id);
  const activeCopy = useChallengeCopy(t, active?.challenge.id ?? main.id);

  const begin = useCallback(
    (challenge: ChallengeDefinition<C>, scored: boolean, startedAt: number) => {
      setActive({ challenge, scored, startedAt, finishedMs: null, runId: Date.now() });
      setView('home');
    },
    []
  );

  const handleRegister = useCallback(
    (nickname: string) => {
      const record = register(nickname, main.id);
      setRegistering(false);
      begin(main, true, record.runs[main.id]?.startedAt ?? Date.now());
    },
    [begin, main, register]
  );

  const handleResume = useCallback(() => {
    const challengeId = pendingChallengeId();
    const challenge = definition.challenges.find((item) => item.id === challengeId);
    const startedAt = challengeId ? player?.runs[challengeId]?.startedAt : undefined;
    if (challenge && startedAt) begin(challenge, true, startedAt);
  }, [begin, definition.challenges, pendingChallengeId, player]);

  const handleFinish = useCallback(
    (elapsedMs: number, fails: number) => {
      setActive((current) => (current ? { ...current, finishedMs: elapsedMs } : current));
      if (!active?.scored || !player) return;

      completeRun(active.challenge.id, elapsedMs, fails);
      void submit({
        gameSlug: definition.slug,
        challenge: active.challenge.id,
        nickname: player.nickname,
        elapsedMs,
        fails,
      });
    },
    [active, completeRun, definition.slug, player, submit]
  );

  const handleStartBonus = useCallback(
    (challenge: ChallengeDefinition<C>) => {
      const alreadyPlayed = player?.runs[challenge.id];
      if (player && !alreadyPlayed) {
        const record = startRun(challenge.id);
        begin(challenge, true, record?.runs[challenge.id]?.startedAt ?? Date.now());
        return;
      }
      begin(challenge, false, Date.now());
    },
    [begin, player, startRun]
  );

  const openBoard = useCallback((challengeId: C) => {
    setBoardChallengeId(challengeId);
    setActive(null);
    setView('board');
  }, []);

  const boardTabs = useMemo(
    () =>
      definition.challenges.map((challenge) => ({
        value: challenge.id,
        label: t(`${challenge.id}.boardTab`),
      })),
    [definition.challenges, t]
  );

  if (!splash.done) {
    return (
      <SplashScreen
        durationMs={definition.splashDurationMs ?? DEFAULT_SPLASH_MS}
        onDone={splash.markDone}
        sponsorName={definition.sponsor?.name ?? 'WildKeys'}
        sponsorLogoSrc={definition.sponsor?.logoSrc}
        subtitle={t('splashSub')}
        loadingLabel={t('splashLoading')}
      />
    );
  }

  return (
    <div className={`${styles.root} ${definition.themeClass}`}>
      <div className={styles.canvas}>
        <GameHeader
          subtitle={active ? activeCopy.headerSub : t('collab')}
          languageLabel={t('boardTitle')}
          showLanguages={!active}
          clock={
            active
              ? {
                  startedAt: active.finishedMs === null ? active.startedAt : null,
                  frozenMs: active.finishedMs ?? 0,
                }
              : undefined
          }
        />

        {active ? (
          <ChallengeRunner
            key={active.runId}
            definition={definition}
            challenge={active.challenge}
            t={t}
            locale={locale}
            startedAt={active.startedAt}
            scored={active.scored}
            nickname={player?.nickname ?? null}
            syncNote={lastOutcome?.status === 'queued' ? t('boardPending') : undefined}
            bonusChallenge={nextBonus(definition, active.challenge)}
            onFinish={handleFinish}
            onStartBonus={handleStartBonus}
            onPlayAgain={() => begin(active.challenge, false, Date.now())}
            onBoard={() => openBoard(active.challenge.id)}
          />
        ) : view === 'board' ? (
          <BoardContainer
            definition={definition}
            t={t}
            activeChallengeId={boardChallengeId}
            onChallengeChange={setBoardChallengeId}
            onBack={() => setView('home')}
            tabs={boardTabs}
            kicker={t(`${boardChallengeId}.boardKicker`)}
          />
        ) : (
          <HomeScreen
            copy={{
              collab: t('collab'),
              title: t('homeTitle'),
              subtitle: t('homeSub'),
              foot: t('homeFoot'),
              keyLabel: t('keyLabel'),
              keyName: t('keyName'),
              keySpecies: t('keySpecies'),
              yourTarget: t('yourTarget'),
              start: t('startLabel'),
              free: t('freeLabel'),
              board: t('boardLabel'),
              resume: t('resumeRun'),
              sponsorSubtitle: t('sponsorSubtitle'),
              sponsorDescription: t('sponsorDescription'),
            }}
            sponsor={definition.sponsor}
            target={{
              photo: main.photo,
              photoLabel: mainCopy.photoPlaceholder,
              name: mainCopy.name,
              caption: mainCopy.caption,
            }}
            player={
              player ? { nickname: player.nickname, note: playerNote(player, main.id) } : null
            }
            canResume={pendingChallengeId() !== null}
            onStart={() => setRegistering(true)}
            onResume={handleResume}
            onFreePlay={() => begin(main, false, Date.now())}
            onBoard={() => openBoard(main.id)}
          />
        )}

        {!active && view === 'home' ? <p className={styles.source}>{t('source')}</p> : null}
      </div>

      <WelcomeDialog
        open={!welcome.done && !active && view === 'home'}
        onDismiss={welcome.markDone}
        copy={{
          title: t('welcomeTitle'),
          body: t('welcomeBody'),
          note: t('welcomeNote'),
          button: t('welcomeBtn'),
        }}
      />

      <RegistrationDialog
        open={registering}
        onCancel={() => setRegistering(false)}
        onConfirm={handleRegister}
        isTaken={isNicknameTaken}
        copy={{
          kicker: t('regKicker'),
          title: t('regTitle'),
          body: t('regBody'),
          placeholder: t('nickPh'),
          warning: t('regWarn'),
          confirm: t('regGo'),
          cancel: t('cancelLabel'),
          errorShort: t('errShort'),
          errorTaken: t('errTaken'),
        }}
      />
    </div>
  );

  /** Nota de estado bajo el nombre del jugador en la portada. */
  function playerNote(record: NonNullable<typeof player>, challengeId: C): string {
    const run = record.runs[challengeId];
    if (run?.completed && run.elapsedMs !== null)
      return t('usedDoneFmt', { t: formatClock(run.elapsedMs) });
    return t('usedPending');
  }
}

function mainChallenge<C extends string>(definition: GameDefinition<C>): ChallengeDefinition<C> {
  const first = definition.challenges[0];
  if (!first) throw new Error(`El juego "${definition.slug}" no declara ningún reto.`);
  return first;
}

/** Siguiente reto marcado como extra tras el que se acaba de ganar. */
function nextBonus<C extends string>(
  definition: GameDefinition<C>,
  current: ChallengeDefinition<C>
): ChallengeDefinition<C> | undefined {
  const index = definition.challenges.indexOf(current);
  return definition.challenges.slice(index + 1).find((challenge) => challenge.bonus);
}
