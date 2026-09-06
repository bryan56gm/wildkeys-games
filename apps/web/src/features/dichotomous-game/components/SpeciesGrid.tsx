import type { SpeciesInPlay } from '@wkg/game-engine';
import { resolveText } from '@wkg/game-engine';
import { cx } from '@wkg/ui';
import { FALLBACK_LOCALE, type Locale } from '@/app/i18n/locale';
import styles from './SpeciesGrid.module.css';

export interface SpeciesGridProps {
  species: readonly SpeciesInPlay<Locale>[];
  locale: Locale;
  columns: number;
  /** Etiqueta accesible de la lista ("Especies en juego"). */
  label: string;
}

/**
 * Rejilla de candidatas. Las descartadas se atenúan y se tachan; el estado se
 * comunica también por texto (`aria-label`) para quien no ve el tachado.
 */
export function SpeciesGrid({ species, locale, columns, label }: SpeciesGridProps) {
  return (
    <ul
      className={styles.grid}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-label={label}
    >
      {species.map(({ species: item, ruledOut }) => (
        <li
          key={item.id}
          className={cx(styles.cell, ruledOut && styles.ruledOut)}
          aria-disabled={ruledOut || undefined}
        >
          {resolveText(item.name, locale, FALLBACK_LOCALE)}
        </li>
      ))}
    </ul>
  );
}
