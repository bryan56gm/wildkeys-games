import type { LeaderboardConfig } from '@wkg/leaderboard';

/**
 * Configuración del leaderboard leída del entorno de build.
 *
 * Devuelve `null` cuando faltan credenciales: es un estado legítimo y
 * soportado (desarrollo sin Supabase, o un despliegue sin clasificación). El
 * juego nunca depende de esto.
 */
export function readLeaderboardConfig(): LeaderboardConfig | null {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) return null;
  return { supabaseUrl, supabaseAnonKey, pageSize: 20 };
}
