import { Fragment, useRef } from 'react';
import { Button, HomeIcon, Kicker, SegmentedControl } from '@wkg/ui';
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
  /** Resumen de la marca propia: «Tu posición», «7.º de 23». */
  youAre: string;
  findMe: string;
  /** Aviso de estado: sin conexión o marca pendiente. */
  notice: string | null;
  /** Texto del botón que fuerza la subida de lo que quedó en cola. */
  retry: string;
}

export interface BoardScreenProps {
  copy: BoardScreenCopy;
  tabs: readonly { value: string; label: string }[];
  activeTab: string;
  onTabChange(tab: string): void;
  rows: readonly ScoreRowData[];
  /**
   * Puesto y tiempo propios en este reto, de toda la clasificación —no solo de
   * lo que se ve—. `null` si aún no se ha competido en él.
   */
  mine: { position: string; time: string } | null;
  /**
   * Hay marcas propias sin subir. El envío se reintenta solo, pero el botón
   * existe para quien acaba de recuperar la cobertura y no quiere esperar.
   */
  onRetry?: (() => void) | undefined;
  retrying?: boolean;
  /** La marca propia no entra en el corte y se ha añadido al final. */
  mineIsFarBelow?: boolean;
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
  mine,
  onRetry,
  retrying = false,
  mineIsFarBelow = false,
  failsLabel,
  onBack,
}: BoardScreenProps) {
  const mineRowRef = useRef<HTMLLIElement>(null);

  return (
    <section className={`${styles.screen} wk-anim-rise`}>
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

      {/*
        Lo primero que se busca al abrir una clasificación es uno mismo. Se dice
        arriba, antes de la lista, y de paso lleva hasta la fila: con veintitantas
        marcas, encontrarse a mano es justo lo que hace que la gente deje de
        mirar el marcador.
      */}
      {mine ? (
        <button
          type="button"
          className={styles.you}
          onClick={() =>
            mineRowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
          }
        >
          <span className={styles.youLabel}>{copy.youAre}</span>
          <span className={styles.youPosition}>{mine.position}</span>
          <span className={styles.youTime}>{mine.time}</span>
          <span className={styles.youFind}>{copy.findMe}</span>
        </button>
      ) : null}

      {copy.notice ? (
        <div className={styles.notice} role="status">
          <p className={styles.noticeText}>{copy.notice}</p>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry} disabled={retrying}>
              {copy.retry}
            </Button>
          ) : null}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className={styles.empty}>{copy.empty}</p>
      ) : (
        <ol className={styles.rows}>
          {rows.map((row, index) => (
            <Fragment key={`${row.name}-${row.elapsedMs}-${row.rank}`}>
              {/* Marca el salto cuando la fila propia viene de mucho más abajo:
                  sin esto parecería que va justo detrás de la anterior. */}
              {mineIsFarBelow && index === rows.length - 1 ? (
                <li className={styles.gap} aria-hidden="true">
                  ···
                </li>
              ) : null}
              <ScoreRow
                ref={row.mine ? mineRowRef : undefined}
                row={row}
                failsLabel={failsLabel(row.fails)}
                youTag={copy.youTag}
                demoTag={copy.demoTag}
              />
            </Fragment>
          ))}
        </ol>
      )}

      <Button variant="outline" size="sm" onClick={onBack} leading={<HomeIcon size={16} />}>
        {copy.back}
      </Button>
    </section>
  );
}
