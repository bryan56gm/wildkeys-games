import { Outlet, useLoaderData, useMatch } from 'react-router';
import { useOfflineQueue } from '@wkg/leaderboard';
import { ConfirmDialog } from '@wkg/ui';
import { GameHeader } from './components/GameHeader';
import { SpeciesPhotoViewer } from './components/SpeciesPhotoViewer';
import { WelcomeDialog } from './components/WelcomeDialog';
import { useChallengeCopy } from './hooks/use-game-copy';
import { useExitRun } from './hooks/use-exit-run';
import { useOnceFlag } from './hooks/use-once-flags';
import { SplashScreen } from './screens/SplashScreen';
import { gameRoutePatterns } from './routes/paths';
import { GameSessionProvider, useGameSession } from './session-context';
import type { AnyGameDefinition } from './types';
import styles from './GameApp.module.css';

const DEFAULT_SPLASH_MS = 8_200;

/**
 * Marco de un juego: carga, cabecera, bienvenida y estado compartido. Las
 * pantallas concretas las pone el router en el `<Outlet>`.
 */
export function GameLayout() {
  const definition = useLoaderData<AnyGameDefinition>();

  return (
    <GameSessionProvider definition={definition}>
      <GameFrame />
    </GameSessionProvider>
  );
}

function GameFrame() {
  const { definition, t, activeRun } = useGameSession();
  const splash = useOnceFlag(definition.slug, 'splash', 'session');
  const welcome = useOnceFlag(definition.slug, 'welcome', 'local');
  const exitRun = useExitRun();
  /**
   * Estar jugando es estar en la URL de la partida, no que quede un objeto en
   * memoria. Derivarlo del objeto dejaba el reloj corriendo en la portada
   * después de salir, porque la partida abandonada sigue ahí hasta que otra la
   * reemplaza — y es la URL, no la memoria, lo que el jugador ve.
   */
  const playing = !!useMatch(`/:gameSlug/${gameRoutePatterns.play}`);
  const runInPlay = playing ? activeRun : null;
  useOfflineQueue(); // vacía la cola de marcas en cuanto vuelve la conexión

  const activeCopy = useChallengeCopy(t, activeRun?.challenge.id ?? definition.challenges[0]!.id);

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
          subtitle={runInPlay ? activeCopy.headerSub : t('collab')}
          languageLabel={t('boardTitle')}
          showLanguages={!runInPlay}
          onHome={exitRun.requestExit}
          homeLabel={t('homeLabel')}
          onExit={runInPlay ? exitRun.requestExit : undefined}
          exitLabel={t('exitLabel')}
          clock={
            runInPlay
              ? {
                  startedAt: runInPlay.finishedMs === null ? runInPlay.startedAt : null,
                  frozenMs: runInPlay.finishedMs ?? 0,
                }
              : undefined
          }
        />
        <Outlet />
      </div>

      <SpeciesPhotoViewer />

      <ConfirmDialog
        open={exitRun.confirming}
        onConfirm={exitRun.exit}
        onCancel={exitRun.stay}
        tone={exitRun.scored ? 'warning' : 'plain'}
        copy={{
          title: t('exitTitle'),
          body: exitRun.scored ? t('exitBodyScored') : t('exitBodyFree'),
          confirm: t('exitConfirm'),
          cancel: t('exitStay'),
        }}
      />

      <WelcomeDialog
        open={!welcome.done && !playing}
        onDismiss={welcome.markDone}
        copy={{
          title: t('welcomeTitle'),
          body: t('welcomeBody'),
          note: t('welcomeNote'),
          button: t('welcomeBtn'),
        }}
      />
    </div>
  );
}
