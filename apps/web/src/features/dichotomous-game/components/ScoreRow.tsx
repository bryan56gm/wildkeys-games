import { Pill, cx } from '@wkg/ui';
import { formatClock } from '@/lib/format/time';
import styles from './ScoreRow.module.css';

export interface ScoreRowData {
  readonly rank: number;
  readonly name: string;
  readonly elapsedMs: number;
  readonly fails: number;
  readonly mine: boolean;
  readonly demo: boolean;
}

export interface ScoreRowProps {
  row: ScoreRowData;
  failsLabel: string;
  youTag: string;
  demoTag: string;
}

/** Una fila del marcador. */
export function ScoreRow({ row, failsLabel, youTag, demoTag }: ScoreRowProps) {
  return (
    <li className={cx(styles.row, row.rank === 1 && styles.leader)}>
      <span
        className={cx(styles.rank, row.rank === 1 ? styles.gold : row.rank <= 3 && styles.podium)}
      >
        {row.rank}
      </span>
      <span className={styles.name}>{row.name}</span>
      {row.mine || row.demo ? (
        <Pill tone={row.mine ? 'brand' : 'neutral'}>{row.mine ? youTag : demoTag}</Pill>
      ) : null}
      <span className={styles.fails}>{failsLabel}</span>
      <span className={styles.time}>{formatClock(row.elapsedMs)}</span>
    </li>
  );
}
