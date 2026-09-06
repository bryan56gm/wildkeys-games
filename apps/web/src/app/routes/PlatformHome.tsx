import { Link } from 'react-router';
import { Card, Kicker } from '@wkg/ui';
import { WkLogo } from '@/app/brand/WkLogo';
import { useLocale } from '@/app/i18n/locale';
import { usePlatformCopy } from '@/app/i18n/platform-copy';
import { GAMES } from '@/games/registry';
import styles from './PlatformHome.module.css';

/** Portada de la plataforma: el catálogo de juegos publicados. */
export function PlatformHome() {
  const t = usePlatformCopy();
  const { locale } = useLocale();

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <span className={styles.logo}>
          <WkLogo height={34} title="WildKeys" />
        </span>
        <h1 className={styles.title}>{t('platformTitle')}</h1>
        <p className={styles.subtitle}>{t('platformSubtitle')}</p>
      </header>

      <section className={styles.list}>
        <Kicker>{t('gamesKicker')}</Kicker>
        {GAMES.map((game) => (
          <Card key={game.slug} className={styles.card}>
            <span className={styles.gameTitle}>{game.title}</span>
            <span className={styles.gameTagline}>
              {game.tagline[locale] ?? Object.values(game.tagline)[0]}
            </span>
            <Link className={styles.play} to={`/${game.slug}`}>
              {t('play')}
            </Link>
          </Card>
        ))}
      </section>
    </main>
  );
}
