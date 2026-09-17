import { useCallback, useRef, useState } from 'react';
import { useSubmitScore } from '@wkg/leaderboard';
import { useGameSession } from '../session-context';

/**
 * Cierra una partida ganada: congela el cronómetro, marca el intento como
 * completado y publica la marca si puntuaba.
 *
 * Se protege contra ejecutarse dos veces — con React en modo estricto los
 * efectos se disparan por duplicado, y eso enviaría la marca dos veces.
 */
export function useFinishRun(): {
  finish(elapsedMs: number, fails: number): void;
  queued: boolean;
  /** La partida libre recién ganada ha batido el récord personal. */
  beatenBest: boolean;
} {
  const { definition, activeRun, player, bests, paths, results, freezeClock } = useGameSession();
  const { submit, lastOutcome } = useSubmitScore();
  const reported = useRef<string | null>(null);
  const [beatenBest, setBeatenBest] = useState(false);

  const finish = useCallback(
    (elapsedMs: number, fails: number) => {
      // Doble guarda: el reloj congelado significa que esta partida ya se
      // cerró, y sobrevive a que la pantalla se vuelva a montar (pasa al abrir
      // el zoom, que es otra URL). El ref cubre el mismo render.
      if (!activeRun || activeRun.finishedMs !== null) return;

      const token = `${activeRun.challenge.id}:${activeRun.startedAt}`;
      if (reported.current === token) return;
      reported.current = token;

      freezeClock(elapsedMs);
      // El recorrido se guarda siempre: es material de repaso, no una marca.
      paths.remember(activeRun.challenge.id, activeRun.state.trail);

      const beaten = !activeRun.scored && bests.record(activeRun.challenge.id, elapsedMs);
      setBeatenBest(beaten);
      // El resultado, entero: es lo que hace que la pantalla final aguante una
      // recarga sin convertirse en una partida nueva.
      results.remember(activeRun.challenge.id, {
        elapsedMs,
        fails,
        scored: activeRun.scored,
        trail: activeRun.state.trail,
        beatenBest: beaten,
      });

      const record = player.player;
      if (!activeRun.scored || !record) return;

      player.completeRun(activeRun.challenge.id, elapsedMs, fails);
      void submit({
        gameSlug: definition.slug,
        challenge: activeRun.challenge.id,
        nickname: record.nickname,
        elapsedMs,
        fails,
      });
    },
    [activeRun, bests, definition.slug, paths, results, freezeClock, player, submit]
  );

  return { finish, queued: lastOutcome?.status === 'queued', beatenBest };
}
