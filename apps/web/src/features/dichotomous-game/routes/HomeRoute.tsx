import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import { formatClock } from '@/lib/format/time';
import { ChallengeCard } from '../components/ChallengeCard';
import { RegistrationDialog } from '../components/RegistrationDialog';
import { useChallengeBoard, type ChallengeStatus } from '../hooks/use-challenge-board';
import { useNicknameTaken } from '../hooks/use-taken-nicknames';
import { usePhotoViewer } from '../hooks/use-photo-viewer';
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
  const { definition, t, player, bests, mainChallenge } = useGameSession();
  const navigate = useNavigate();
  const board = useChallengeBoard();
  const isNicknameTaken = useNicknameTaken(definition);
  const photoOf = useSpeciesPhoto();
  const viewer = usePhotoViewer();
  const slug = definition.slug;

  /**
   * Navega a la partida diciendo si puntúa. Arrancarla es cosa de `PlayRoute`:
   * con una sola fuente de verdad no hay forma de que la ruta y la partida se
   * contradigan a mitad de camino.
   */
  const play = useCallback(
    (challengeId: string, scored: boolean, startedAt: number) => {
      void navigate(gamePaths.play(slug, challengeId), { state: { scored, startedAt } });
    },
    [navigate, slug]
  );

  const handleRegister = useCallback(
    (nickname: string) => {
      const record = player.register(nickname, mainChallenge.id);
      play(mainChallenge.id, true, record.runs[mainChallenge.id]?.startedAt ?? Date.now());
    },
    [mainChallenge.id, play, player]
  );

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
          board: t('boardLabel'),
          wildkeysTitle: t('wkHomeTitle'),
          wildkeysBody: t('wkHomeBody'),
          wildkeysCta: t('wildkeysLabel'),
          sponsorTitle: t('sponsorTitle'),
          sponsorSubtitle: t('sponsorSubtitle'),
          sponsorDescription: t('sponsorDescription'),
          challengesLabel: t('challengesLabel'),
          slideLabel: (position, total) => t('slideFmt', { n: position, total }),
        }}
        sponsor={definition.sponsor}
        challenges={byUrgency(board).map(renderChallenge)}
        player={record ? { nickname: record.nickname, note: playerNote() } : null}
        wildkeysHref={definition.externalCtaHref}
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

  function renderChallenge(status: ChallengeStatus) {
    const { challenge, stage } = status;
    const targetId = challenge.key.targetSpeciesId;

    return (
      <ChallengeCard
        key={challenge.id}
        copy={{
          kicker: challenge.bonus ? t(`${challenge.id}.bonusKicker`) : t('yourTarget'),
          name: t(`${challenge.id}.name`),
          caption: t(`${challenge.id}.caption`),
          photoLabel: t(`${challenge.id}.photoPlaceholder`),
          zoomLabel: t('zoomLabel'),
          action: actionLabel(status),
          note: noteFor(status),
          best: bestNote(challenge.id),
        }}
        photo={photoOf(targetId)}
        stage={stage}
        photoFit={board.length > 1 ? 'fixed' : 'adaptive'}
        onViewPhoto={() => viewer.open(targetId)}
        onAction={() => startChallenge(status)}
      />
    );
  }

  /**
   * Qué ofrece el botón de un reto, según en qué punto esté.
   *
   * Un reto bloqueado enseña la misma etiqueta que tendrá cuando se abra, solo
   * que apagada: así se ve qué hay detrás sin prometer nada distinto.
   */
  function actionLabel(status: ChallengeStatus): string {
    switch (status.stage) {
      case 'running':
        return t('resumeRun');
      case 'done':
        return t('improveLabel');
      case 'locked':
      case 'open':
        return t('startLabel');
    }
  }

  /** Qué se cuenta bajo el nombre: la marca, el aviso o qué lo desbloquea. */
  function noteFor(status: ChallengeStatus): string {
    switch (status.stage) {
      case 'locked':
        return t('lockedFmt', { name: nameOf(status.unlockedBy?.id) });
      case 'running':
        return t('usedPending');
      case 'done':
        return status.elapsedMs === null
          ? t('replayNote')
          : t('markFmt', { t: formatClock(status.elapsedMs) });
      case 'open':
        return t('scoredNote');
    }
  }

  /**
   * Empieza —o retoma— un reto. Puntúa solo la primera vez y con jugador
   * registrado: repetir siempre es para practicar, nunca queda bloqueado.
   */
  function startChallenge({ challenge, stage, startedAt }: ChallengeStatus) {
    if (stage === 'locked') return;

    if (stage === 'open' && !record) {
      return void navigate(gamePaths.register(slug));
    }

    if (stage === 'running' && startedAt !== null) {
      return play(challenge.id, true, startedAt);
    }

    if (stage === 'open' && record) {
      const started = player.startRun(challenge.id);
      return play(challenge.id, true, started?.runs[challenge.id]?.startedAt ?? Date.now());
    }

    play(challenge.id, false, Date.now());
  }

  /**
   * Los retos se ordenan por lo que el jugador puede hacer ahora, no por cómo
   * están declarados: lo empezado, lo que puede jugar, lo que aún no tiene y,
   * al final, lo ya superado. Recién competido el principal, esto deja el reto
   * extra en cabeza sin que nadie tenga que decirlo.
   */
  function byUrgency(statuses: readonly ChallengeStatus[]): readonly ChallengeStatus[] {
    const priority: Record<ChallengeStatus['stage'], number> = {
      running: 0,
      open: 1,
      locked: 2,
      done: 3,
    };
    return [...statuses].sort((a, b) => priority[a.stage] - priority[b.stage]);
  }

  /**
   * El récord propio, solo cuando existe. Se dice aparte de la marca de la
   * clasificación y con otras palabras a propósito: son dos cosas distintas y
   * mezclarlas haría creer que repetir mejora el puesto, que no es verdad.
   */
  function bestNote(challengeId: string): string | null {
    const best = bests.bestOf(challengeId);
    return best === null ? null : t('bestFmt', { t: formatClock(best) });
  }

  function nameOf(challengeId: string | undefined): string {
    return challengeId ? t(`${challengeId}.name`) : '';
  }

  /** Nota de estado bajo el nombre del jugador. */
  function playerNote(): string {
    const pending = board.find((status) => status.stage === 'running');
    if (pending) return t('usedPending');

    const done = board.filter((status) => status.stage === 'done').length;
    return t('progressFmt', { n: done, total: board.length });
  }
}
