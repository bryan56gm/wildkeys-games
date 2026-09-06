import { Button, Kicker, SegmentedControl } from '@wkg/ui';
import { ScoreRow, type ScoreRowData } from '../components/ScoreRow';
import styles from './BoardScreen.module.css';

export interface BoardScreenCopy {
  kicker: string;
  title: string;
  body: string;
  empty: string;
  back: string;
  youTag: string;
  demoTag: string;
  tabsLabel: string;
  /** Aviso de estado: sin conexión, marca pendiente, hora de sincronización. */
  notice: string | null;
}

export interface BoardScreenProps {
  copy: BoardScreenCopy;
  tabs: readonly { value: string; label: string }[];
  activeTab: string;
  onTabChange(tab: string): void;
  rows: readonly ScoreRowData[];
  failsLabel(fails: number): string;
  onBack(): void;
}

/** Clasificación del evento, por reto. */
export function BoardScreen({
  copy,
  tabs,
  activeTab,
  onTabChange,
  rows,
  failsLabel,
  onBack,
}: BoardScreenProps) {
  return (
    <section className={styles.screen}>
      <header className={styles.head}>
        <Kicker tone="brand">{copy.kicker}</Kicker>
        <h2 className={styles.title}>{copy.title}</h2>
        <p className={styles.body}>{copy.body}</p>
      </header>

      {tabs.length > 1 ? (
        <SegmentedControl
          items={tabs}
          value={activeTab}
          onChange={onTabChange}
          label={copy.tabsLabel}
          size="md"
        />
      ) : null}

      {copy.notice ? (
        <p className={styles.notice} role="status">
          {copy.notice}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <p className={styles.empty}>{copy.empty}</p>
      ) : (
        <ol className={styles.rows}>
          {rows.map((row) => (
            <ScoreRow
              key={`${row.name}-${row.elapsedMs}-${row.rank}`}
              row={row}
              failsLabel={failsLabel(row.fails)}
              youTag={copy.youTag}
              demoTag={copy.demoTag}
            />
          ))}
        </ol>
      )}

      <Button variant="outline" size="sm" onClick={onBack}>
        {copy.back}
      </Button>
    </section>
  );
}
