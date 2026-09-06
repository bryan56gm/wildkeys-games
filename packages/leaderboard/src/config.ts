/** Credenciales y límites del leaderboard. */
export interface LeaderboardConfig {
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
  /** Marcas que se piden por consulta. */
  readonly pageSize?: number;
}

/**
 * Reglas de validación del cliente. Son un espejo de los CHECK del esquema:
 * aquí evitan un viaje inútil y dan un mensaje claro; la garantía real la da
 * la base de datos (ver `supabase/migrations/`).
 */
export const SCORE_LIMITS = {
  nicknameMaxLength: 14,
  nicknameMinLength: 2,
  /** Nadie recorre una clave de verdad en menos de 3 s. */
  minElapsedMs: 3_000,
  /** 2 horas: por encima, es una partida abandonada, no una marca. */
  maxElapsedMs: 7_200_000,
  maxFails: 999,
} as const;

/** Motivo por el que una marca no es publicable, o `null` si es válida. */
export function validateScore(draft: {
  nickname: string;
  elapsedMs: number;
  fails: number;
}): string | null {
  const nickname = draft.nickname.trim();
  if (nickname.length < SCORE_LIMITS.nicknameMinLength) return 'nickname-too-short';
  if (nickname.length > SCORE_LIMITS.nicknameMaxLength) return 'nickname-too-long';
  if (!Number.isFinite(draft.elapsedMs) || draft.elapsedMs < SCORE_LIMITS.minElapsedMs)
    return 'elapsed-too-short';
  if (draft.elapsedMs > SCORE_LIMITS.maxElapsedMs) return 'elapsed-too-long';
  if (!Number.isInteger(draft.fails) || draft.fails < 0 || draft.fails > SCORE_LIMITS.maxFails)
    return 'fails-invalid';
  return null;
}
