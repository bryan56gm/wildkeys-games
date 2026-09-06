import { Avatar, Button, Card, Kicker } from '@wkg/ui';
import { TargetCard } from '../components/TargetCard';
import type { PhotoRef, SponsorDefinition } from '../types';
import styles from './HomeScreen.module.css';

export interface HomeScreenCopy {
  collab: string;
  title: string;
  subtitle: string;
  foot: string;
  keyLabel: string;
  keyName: string;
  keySpecies: string;
  yourTarget: string;
  start: string;
  free: string;
  board: string;
  resume: string;
  sponsorSubtitle: string;
  sponsorDescription: string;
}

export interface HomeScreenProps {
  copy: HomeScreenCopy;
  sponsor?: SponsorDefinition | undefined;
  target: { photo: PhotoRef; photoLabel: string; name: string; caption: string };
  /** Jugador ya registrado en este dispositivo, con su nota de estado. */
  player: { nickname: string; note: string } | null;
  canResume: boolean;
  onStart(): void;
  onResume(): void;
  onFreePlay(): void;
  onBoard(): void;
}

/** Portada del juego: qué hay que identificar y cómo empezar. */
export function HomeScreen({
  copy,
  sponsor,
  target,
  player,
  canResume,
  onStart,
  onResume,
  onFreePlay,
  onBoard,
}: HomeScreenProps) {
  return (
    <section className={`${styles.screen} wk-anim-rise`}>
      <header className={styles.intro}>
        <Kicker tone="brand" className={styles.badge}>
          {copy.collab}
        </Kicker>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.subtitle}>{copy.subtitle}</p>
      </header>

      {sponsor ? (
        <Card tone="accent" className={styles.sponsor}>
          <div className={styles.sponsorHead}>
            <span className={styles.sponsorLogo}>
              <img src={sponsor.logoSrc} alt={sponsor.name} />
            </span>
            <div className={styles.sponsorNames}>
              <span className={styles.sponsorName}>{sponsor.name}</span>
              <span className={styles.sponsorSub}>{copy.sponsorSubtitle}</span>
            </div>
          </div>
          <p className={styles.sponsorText}>{copy.sponsorDescription}</p>
        </Card>
      ) : null}

      <TargetCard
        photo={target.photo}
        photoLabel={target.photoLabel}
        kicker={copy.yourTarget}
        name={target.name}
        caption={target.caption}
        layout="stacked"
      />

      <Card className={styles.keyCard}>
        <Kicker>{copy.keyLabel}</Kicker>
        <span className={styles.keyName}>{copy.keyName}</span>
        <span className={styles.keySpecies}>{copy.keySpecies}</span>
      </Card>

      <div className={styles.actions}>
        {player ? (
          <Card className={styles.player}>
            <Avatar name={player.nickname} />
            <div className={styles.playerText}>
              <span className={styles.playerName}>{player.nickname}</span>
              <span className={styles.playerNote}>{player.note}</span>
            </div>
          </Card>
        ) : (
          <Button size="lg" onClick={onStart} trailing={<Chevron />}>
            {copy.start}
          </Button>
        )}

        {canResume ? <Button onClick={onResume}>{copy.resume}</Button> : null}

        <div className={styles.secondary}>
          <Button variant="outline" size="sm" onClick={onFreePlay}>
            {copy.free}
          </Button>
          <Button variant="neutral" size="sm" onClick={onBoard}>
            {copy.board}
          </Button>
        </div>
      </div>

      <p className={styles.foot}>{copy.foot}</p>
    </section>
  );
}

function Chevron() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
