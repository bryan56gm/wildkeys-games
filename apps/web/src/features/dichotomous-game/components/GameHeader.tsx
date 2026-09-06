import { SegmentedControl } from '@wkg/ui';
import { WkLogo } from '@/app/brand/WkLogo';
import { SUPPORTED_LOCALES, useLocale, type Locale } from '@/app/i18n/locale';
import styles from './GameHeader.module.css';
import { LiveClock } from './LiveClock';

const LOCALE_ITEMS = SUPPORTED_LOCALES.map((locale) => ({
  value: locale,
  label: locale.toUpperCase(),
}));

export interface GameHeaderProps {
  /** Rótulo bajo la marca: colaboración o reto activo. */
  subtitle: string;
  /** Etiqueta accesible del selector de idioma. */
  languageLabel: string;
  /** Cronómetro visible solo mientras se juega o al ganar. */
  clock?: { startedAt: number | null; frozenMs: number } | undefined;
  showLanguages?: boolean;
}

/** Cabecera persistente: marca, cronómetro e idioma. */
export function GameHeader({
  subtitle,
  languageLabel,
  clock,
  showLanguages = true,
}: GameHeaderProps) {
  const { locale, setLocale } = useLocale();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>
          <WkLogo height={28} title="WildKeys" />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>WildKeys</span>
          <span className={styles.brandSub}>{subtitle}</span>
        </span>
      </div>

      <div className={styles.actions}>
        {clock ? <LiveClock startedAt={clock.startedAt} frozenMs={clock.frozenMs} /> : null}
        {showLanguages ? (
          <SegmentedControl<Locale>
            items={LOCALE_ITEMS}
            value={locale}
            onChange={setLocale}
            label={languageLabel}
          />
        ) : null}
      </div>
    </header>
  );
}
