import { useCallback, useState } from 'react';
import type { ScoreDraft, SubmitOutcome } from '../types.js';
import { useLeaderboardService } from './context.js';

export interface UseSubmitScoreResult {
  /** Publica la marca; si no hay red la deja en cola y lo indica. */
  submit(draft: ScoreDraft): Promise<SubmitOutcome>;
  readonly submitting: boolean;
  readonly lastOutcome: SubmitOutcome | null;
}

/**
 * Envío de una marca al terminar una partida puntuable. Nunca lanza: el
 * resultado ("publicada", "en cola", "rechazada") se expone como dato para que
 * la pantalla de victoria decida qué contar al jugador.
 */
export function useSubmitScore(): UseSubmitScoreResult {
  const service = useLeaderboardService();
  const [submitting, setSubmitting] = useState(false);
  const [lastOutcome, setLastOutcome] = useState<SubmitOutcome | null>(null);

  const submit = useCallback(
    async (draft: ScoreDraft) => {
      setSubmitting(true);
      try {
        const outcome = await service.submit(draft);
        setLastOutcome(outcome);
        return outcome;
      } finally {
        setSubmitting(false);
      }
    },
    [service]
  );

  return { submit, submitting, lastOutcome };
}
