import { Button, Pill } from '@wkg/ui';
import type { TrailStep } from '@wkg/game-engine';
import styles from './TrailStrip.module.css';

export interface TrailStripProps {
  trail: readonly TrailStep[];
  title: string;
  undoLabel: string;
  onUndo(): void;
}

/** Pasos ya dados, con la opción de deshacer el último sin penalización. */
export function TrailStrip({ trail, title, undoLabel, onUndo }: TrailStripProps) {
  if (trail.length === 0) return null;

  return (
    <section className={styles.wrapper}>
      <div className={styles.head}>
        <span className={styles.title}>{title}</span>
        <Button variant="ghost" block={false} onClick={onUndo}>
          {undoLabel}
        </Button>
      </div>
      <ol className={styles.steps} aria-label={title}>
        {trail.map((step, index) => (
          <li key={`${step.nodeId}-${index}`}>
            <Pill tone="mono">{step.tag}</Pill>
          </li>
        ))}
      </ol>
    </section>
  );
}
