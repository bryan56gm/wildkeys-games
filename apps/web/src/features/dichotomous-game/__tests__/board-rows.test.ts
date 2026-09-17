import { describe, expect, it } from 'vitest';
import type { ScoreEntry } from '@wkg/leaderboard';
import { rankedRows, visibleRows } from '../board-rows';

const entry = (nickname: string, elapsedMs: number, mine = false): ScoreEntry => ({
  id: nickname,
  createdAt: '2026-09-17T10:00:00Z',
  gameSlug: 'lovilot',
  challenge: 'hop',
  nickname,
  elapsedMs,
  fails: 0,
  mine,
});

describe('rankedRows', () => {
  it('ordena por tiempo y numera desde uno', () => {
    const rows = rankedRows([entry('B', 90_000), entry('A', 60_000)], [], 'hop');
    expect(rows.map((row) => [row.rank, row.name])).toEqual([
      [1, 'A'],
      [2, 'B'],
    ]);
  });

  it('desempata por fallos: mismo tiempo, gana quien falló menos', () => {
    const rows = rankedRows(
      [
        { ...entry('Fallón', 60_000), fails: 3 },
        { ...entry('Limpio', 60_000), fails: 0 },
      ],
      [],
      'hop'
    );
    expect(rows[0]?.name).toBe('Limpio');
  });

  it('mezcla las marcas de ejemplo del reto pedido, y solo de ese', () => {
    const rows = rankedRows(
      [entry('Real', 70_000)],
      [
        { challenge: 'hop', name: 'Demo', elapsedMs: 50_000, fails: 0 },
        { challenge: 'carn', name: 'Otra', elapsedMs: 10_000, fails: 0 },
      ],
      'hop'
    );
    expect(rows.map((row) => row.name)).toEqual(['Demo', 'Real']);
    expect(rows[0]?.demo).toBe(true);
  });
});

describe('visibleRows', () => {
  it('añade la marca propia cuando se queda fuera del corte, con su puesto real', () => {
    const rows = rankedRows(
      [
        ...Array.from({ length: 12 }, (_, i) => entry(`P${i}`, 10_000 + i)),
        entry('Yo', 99_000, true),
      ],
      [],
      'hop'
    );

    const visible = visibleRows(rows, 3);
    expect(visible.mineIsFarBelow).toBe(true);
    expect(visible.rows).toHaveLength(4);
    expect(visible.rows.at(-1)).toMatchObject({ name: 'Yo', rank: 13 });
  });

  it('no duplica la marca propia si ya entra en el corte', () => {
    const rows = rankedRows([entry('Yo', 10_000, true), entry('Otro', 20_000)], [], 'hop');
    const visible = visibleRows(rows, 12);

    expect(visible.mineIsFarBelow).toBe(false);
    expect(visible.rows.filter((row) => row.mine)).toHaveLength(1);
  });
});
