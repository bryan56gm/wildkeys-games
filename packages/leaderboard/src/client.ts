import type { SupabaseClient } from '@supabase/supabase-js';
import type { LeaderboardConfig } from './config.js';
import type { Database } from './database.types.js';

export type LeaderboardClient = SupabaseClient<Database>;

/**
 * Carga el SDK de Supabase y crea el cliente **bajo demanda**.
 *
 * Jugar no necesita red, así que el SDK no puede estar en el camino crítico de
 * arranque: se importa la primera vez que hace falta la clasificación. El
 * service worker lo tiene precacheado igualmente, de modo que también funciona
 * sin conexión cuando toca vaciar la cola.
 *
 * Sin sesión ni refresco de tokens: la app no tiene login y todo el acceso va
 * con la clave anónima contra políticas RLS.
 */
export async function connectLeaderboardClient(
  config: LeaderboardConfig
): Promise<LeaderboardClient> {
  const { createClient } = await import('@supabase/supabase-js');

  return createClient<Database>(config.supabaseUrl, config.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    realtime: { params: { eventsPerSecond: 2 } },
  });
}
