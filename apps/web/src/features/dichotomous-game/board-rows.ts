import type { ScoreEntry } from '@wkg/leaderboard';
import type { ScoreRowData } from './components/ScoreRow';
import type { DemoScore } from './types';

/**
 * La clasificación de un reto, ya ordenada y numerada.
 *
 * Vive fuera de la pantalla del marcador porque no es solo suya: la victoria
 * también necesita saber en qué puesto has quedado, y si cada una hiciera su
 * propia cuenta acabarían diciendo cosas distintas del mismo tiempo.
 *
 * Las marcas de ejemplo entran en la ordenación igual que las reales —se ven
 * en el marcador, así que también cuentan para el puesto— pero van marcadas
 * como demo para que nadie las confunda con gente del evento.
 */
export function rankedRows(
  entries: readonly ScoreEntry[],
  demoScores: readonly DemoScore<string>[],
  challenge: string
): readonly ScoreRowData[] {
  const real = entries.map((entry) => ({
    name: entry.nickname,
    elapsedMs: entry.elapsedMs,
    fails: entry.fails,
    mine: entry.mine,
    demo: false,
  }));

  const demo = demoScores
    .filter((score) => score.challenge === challenge)
    .map((score) => ({
      name: score.name,
      elapsedMs: score.elapsedMs,
      fails: score.fails,
      mine: false,
      demo: true,
    }));

  return [...real, ...demo]
    .sort((a, b) => a.elapsedMs - b.elapsedMs || a.fails - b.fails)
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

/**
 * Las filas que se enseñan: las primeras y, si la tuya no cabe, la tuya.
 *
 * Quedar el vigésimo y no encontrarse en la lista es la forma más rápida de
 * que alguien deje de mirar el marcador. Si la marca propia se sale del corte,
 * se añade al final conservando su puesto real.
 */
export function visibleRows(
  rows: readonly ScoreRowData[],
  limit: number
): { readonly rows: readonly ScoreRowData[]; readonly mineIsFarBelow: boolean } {
  const top = rows.slice(0, limit);
  const mine = rows.find((row) => row.mine);
  const mineIsFarBelow = !!mine && !top.includes(mine);

  return { rows: mineIsFarBelow && mine ? [...top, mine] : top, mineIsFarBelow };
}
