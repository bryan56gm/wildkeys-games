/**
 * Clasificación de la plataforma: cliente de Supabase, cola offline y hooks.
 * Es el único paquete que habla con la red — el juego funciona sin él.
 */
export * from './types.js';
export { nextRetryDelay } from './retry.js';
export { SCORE_LIMITS, validateScore, type LeaderboardConfig } from './config.js';
export type { Database, ScoreInsert, ScoreRow } from './database.types.js';
export { connectLeaderboardClient, type LeaderboardClient } from './client.js';
export {
  createLeaderboardService,
  type BoardSnapshot,
  type LeaderboardService,
  type LeaderboardServiceOptions,
} from './service.js';
export { resolveDeviceId, randomId } from './device.js';
export { createScoreQueue, type ScoreQueue } from './queue.js';
export { compareEntries, mergeWithPending, withRanks } from './ranking.js';
export { LeaderboardProvider, useLeaderboardService } from './react/context.js';
export {
  useLeaderboard,
  type LeaderboardSource,
  type UseLeaderboardResult,
} from './react/use-leaderboard.js';
export { useSubmitScore, type UseSubmitScoreResult } from './react/use-submit-score.js';
export { useOfflineQueue, type UseOfflineQueueResult } from './react/use-offline-queue.js';
