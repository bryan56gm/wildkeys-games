import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { formatClock } from '@/lib/format/time';
import { RegistrationDialog } from '../components/RegistrationDialog';
import { useChallengeCopy } from '../hooks/use-game-copy';
import { useNicknameTaken } from '../hooks/use-taken-nicknames';
import { useSpeciesPhoto } from '../hooks/use-species-photo';
import { HomeScreen } from '../screens/HomeScreen';
import { useGameSession } from '../session-context';
import { gamePaths } from './paths';
import styles from '../GameApp.module.css';

/**
 * Portada del juego. El registro es una URL propia (`/registro`), así que el
 * botón «atrás» cierra el diálogo en vez de salirse del juego.
 */
export function HomeRoute({ registering = false }: { registering?: boolean }) {
  const { definition, t, player, mainChallenge, begin, challengeById } = useGameSession();
  const navigate = useNavigate();
  const mainCopy = useChallengeCopy(t, mainChallenge.id);
  const isNicknameTaken = useNicknameTaken(definition);
  const photoOf = useSpeciesPhoto();
  const slug = definition.slug;

  const play = useCallback(
    (challengeId: string, scored: boolean, startedAt: number) => {
      const challenge = challengeById(challengeId);
      if (!challenge) return;
      begin(challenge, scored, startedAt);
      void navigate(gamePaths.play(slug, challengeId));
    },
    [begin, challengeById, navigate, slug]
  );

  const handleRegister = useCallback(
    (nickname: string) => {
      const record = player.register(nickname, mainChallenge.id);
      play(mainChallenge.id, true, record.runs[mainChallenge.id]?.startedAt ?? Date.now());
    },
    [mainChallenge.id, play, player]
  );

  const handleResume = useCallback(() => {
    const challengeId = player.pendingChallengeId();
    const startedAt = challengeId ? player.player?.runs[challengeId]?.startedAt : undefined;
    if (challengeId && startedAt) play(challengeId, true, startedAt);
  }, [play, player]);

  const record = player.player;

  return (
    <>
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
          photo: photoOf(mainChallenge.key.targetSpeciesId),
          photoLabel: mainCopy.photoPlaceholder,
          name: mainCopy.name,
          caption: mainCopy.caption,
        }}
        player={record ? { nickname: record.nickname, note: playerNote() } : null}
        canResume={player.pendingChallengeId() !== null}
        onStart={() => void navigate(gamePaths.register(slug))}
        onResume={handleResume}
        onFreePlay={() => play(mainChallenge.id, false, Date.now())}
        onBoard={() => void navigate(gamePaths.board(slug, mainChallenge.id))}
      />
      <p className={styles.source}>{t('source')}</p>

      <RegistrationDialog
        open={registering}
        onCancel={() => void navigate(gamePaths.home(slug), { replace: true })}
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
    </>
  );

  /** Nota de estado bajo el nombre del jugador. */
  function playerNote(): string {
    const run = record?.runs[mainChallenge.id];
    if (run?.completed && run.elapsedMs !== null) {
      return t('usedDoneFmt', { t: formatClock(run.elapsedMs) });
    }
    return t('usedPending');
  }
}
