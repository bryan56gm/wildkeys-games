import { Outlet, useLoaderData } from 'react-router';
import { useOfflineQueue } from '@wkg/leaderboard';
import { GameHeader } from './components/GameHeader';
import { WelcomeDialog } from './components/WelcomeDialog';
import { useChallengeCopy } from './hooks/use-game-copy';
import { useOnceFlag } from './hooks/use-once-flags';
import { SplashScreen } from './screens/SplashScreen';
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
          subtitle={activeRun ? activeCopy.headerSub : t('collab')}
          languageLabel={t('boardTitle')}
          showLanguages={!activeRun}
          clock={
            activeRun
              ? {
                  startedAt: activeRun.finishedMs === null ? activeRun.startedAt : null,
                  frozenMs: activeRun.finishedMs ?? 0,
                }
              : undefined
          }
        />
        <Outlet />
      </div>

      <WelcomeDialog
        open={!welcome.done && !activeRun}
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
