import { resolveText, type ResolvedStep } from '@wkg/game-engine';
import { FALLBACK_LOCALE, type Locale } from '@/app/i18n/locale';
import styles from './SolvedPath.module.css';

export interface SolvedPathProps {
  path: readonly ResolvedStep<Locale>[];
  locale: Locale;
}

/**
 * El recorrido con el que se llegó a la especie, paso a paso.
 *
 * Es el material de repaso del juego —para qué servía cada carácter de la
 * clave— así que se enseña igual al terminar y al volver a consultarlo días
 * después: una sola pieza, un solo aspecto.
 */
export function SolvedPath({ path, locale }: SolvedPathProps) {
  return (
    <ol className={styles.list}>
      {path.map(({ step, option }, index) => (
        <li key={`${step.nodeId}-${index}`} className={styles.item}>
          <span className={styles.tag}>{option.tag}</span>
          <span className={styles.text}>{resolveText(option.text, locale, FALLBACK_LOCALE)}</span>
        </li>
      ))}
    </ol>
  );
}
