import { IconButton, PlainButton, SegmentedControl } from '@wkg/ui';
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
  /** Vuelve a la portada del juego. La marca es el camino de vuelta de siempre. */
  onHome(): void;
  homeLabel: string;
  /** Salida explícita, visible solo mientras se juega. */
  onExit?: (() => void) | undefined;
  exitLabel: string;
}

/** Cabecera persistente: marca, cronómetro, salida e idioma. */
export function GameHeader({
  subtitle,
  languageLabel,
  clock,
  showLanguages = true,
  onHome,
  homeLabel,
  onExit,
  exitLabel,
}: GameHeaderProps) {
  const { locale, setLocale } = useLocale();

  return (
    <header className={styles.header}>
      <PlainButton className={styles.brand} onClick={onHome} label={homeLabel}>
        <span className={styles.logo}>
          <WkLogo height={28} title="WildKeys" />
        </span>
        <span className={styles.brandText}>
          <span className={styles.brandName}>WildKeys</span>
          <span className={styles.brandSub}>{subtitle}</span>
        </span>
      </PlainButton>

      <div className={styles.actions}>
        {clock ? <LiveClock startedAt={clock.startedAt} frozenMs={clock.frozenMs} /> : null}
        {/* Ocupa el hueco que deja el selector de idioma mientras se juega. */}
        {onExit ? (
          <IconButton label={exitLabel} onClick={onExit}>
            <ExitIcon />
          </IconButton>
        ) : null}
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

function ExitIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
