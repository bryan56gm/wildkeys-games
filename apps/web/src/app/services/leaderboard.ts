import {
  connectLeaderboardClient,
  createLeaderboardService,
  resolveDeviceId,
  type LeaderboardService,
} from '@wkg/leaderboard';
import { readLeaderboardConfig } from '@/lib/env';
import { createSafeStorage } from '@/lib/storage/safe-storage';

let instance: LeaderboardService | null = null;

/**
 * Servicio de clasificación de la aplicación, creado una sola vez.
 *
 * Si no hay credenciales de Supabase queda en modo local: el juego funciona
 * igual y las marcas se guardan en cola por si algún día se configura. El SDK
 * de Supabase solo se descarga cuando la clasificación entra en juego.
 */
export function getLeaderboardService(): LeaderboardService {
  if (instance) return instance;

  const store = createSafeStorage('local');
  const config = readLeaderboardConfig();

  instance = createLeaderboardService({
    connect: config ? () => connectLeaderboardClient(config) : null,
    config: config ?? undefined,
    store,
    deviceId: resolveDeviceId(store),
  });
  return instance;
}
