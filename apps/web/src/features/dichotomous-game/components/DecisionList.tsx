import type { KeyOption } from '@wkg/game-engine';
import { resolveText } from '@wkg/game-engine';
import { FALLBACK_LOCALE, type Locale } from '@/app/i18n/locale';
import styles from './DecisionList.module.css';

export interface DecisionListProps {
  options: readonly KeyOption<Locale>[];
  locale: Locale;
  onPick(optionIndex: number): void;
}

/** Las 2-3 ramas del paso actual. Cada una es un objetivo táctil grande. */
export function DecisionList({ options, locale, onPick }: DecisionListProps) {
  return (
    <div className={styles.list}>
      {options.map((option, index) => (
        <button
          key={option.tag}
          type="button"
          className={styles.option}
          onClick={() => onPick(index)}
        >
          <span className={styles.tag}>{option.tag}</span>
          <span className={styles.text}>{resolveText(option.text, locale, FALLBACK_LOCALE)}</span>
        </button>
      ))}
    </div>
  );
}
