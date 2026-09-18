import type { ReactNode } from 'react';
import { Avatar, Button, Card, Carousel, Kicker, RichText, TrophyIcon } from '@wkg/ui';
import { BrandOutro } from '../components/BrandOutro';
import type { SponsorDefinition } from '../types';
import styles from './HomeScreen.module.css';

export interface HomeScreenCopy {
  collab: string;
  title: string;
  subtitle: string;
  foot: string;
  keyLabel: string;
  keyName: string;
  keySpecies: string;
  board: string;
  /** Tarjeta de cierre: invita a la plataforma, sin explicar el juego. */
  wildkeysTitle: string;
  wildkeysBody: string;
  wildkeysCta: string;
  /** Rótulo grande de la colaboración: «Especial LO VILOT». */
  sponsorTitle: string;
  sponsorSubtitle: string;
  sponsorDescription: string;
  challengesLabel: string;
  /** «Reto 2 de 2», rótulo del carrusel. */
  slideLabel(position: number, total: number): string;
}

export interface HomeScreenProps {
  copy: HomeScreenCopy;
  sponsor?: SponsorDefinition | undefined;
  /**
   * Los retos del juego, en el orden en que deben ofrecerse: cada uno trae su
   * estado y su acción. La portada no decide cuántos hay ni qué se puede hacer
   * con ellos; solo los coloca.
   */
  challenges: readonly ReactNode[];
  /** Jugador ya registrado en este dispositivo, con su nota de estado. */
  player: { nickname: string; note: string } | null;
  /** Enlace a wildkeys.io, la plataforma de la que sale el juego. */
  wildkeysHref: string;
  onBoard(): void;
}

/** Portada del juego: en qué punto estás y qué puedes jugar ahora. */
export function HomeScreen({
  copy,
  sponsor,
  challenges,
  player,
  wildkeysHref,
  onBoard,
}: HomeScreenProps) {
  return (
    <section className={`${styles.screen} wk-anim-rise`}>
      <header className={styles.intro}>
        <Kicker tone="brand" className={styles.badge}>
          {copy.collab}
        </Kicker>
        <h1 className={styles.title}>
          <RichText text={copy.title} />
        </h1>
        <p className={styles.subtitle}>
          <RichText text={copy.subtitle} />
        </p>
      </header>

      {sponsor ? (
        <Card tone="accent" className={styles.sponsor}>
          <div className={styles.sponsorHead}>
            <span className={styles.sponsorLogo}>
              <img src={sponsor.logoSrc} alt={sponsor.name} />
            </span>
            <div className={styles.sponsorNames}>
              <span className={styles.sponsorName}>{copy.sponsorTitle}</span>
              <span className={styles.sponsorSub}>{copy.sponsorSubtitle}</span>
            </div>
          </div>
          <p className={styles.sponsorText}>{copy.sponsorDescription}</p>
        </Card>
      ) : null}

      <Carousel label={copy.challengesLabel} slideLabel={copy.slideLabel}>
        {challenges}
      </Carousel>

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
        ) : null}

        {/* Jugar es cosa de cada tarjeta; aquí solo queda lo que no es de
            ningún reto en concreto. */}
        <Button variant="neutral" size="sm" onClick={onBoard} leading={<TrophyIcon size={16} />}>
          {copy.board}
        </Button>
      </div>

      {/* La misma tarjeta con la que se despide el juego al terminar, pero
          hablando de lo que hay en WildKeys en vez de explicar lo que aún no
          has hecho. */}
      <BrandOutro
        title={copy.wildkeysTitle}
        body={copy.wildkeysBody}
        cta={copy.wildkeysCta}
        href={wildkeysHref}
      />

      <p className={styles.foot}>{copy.foot}</p>
    </section>
  );
}
