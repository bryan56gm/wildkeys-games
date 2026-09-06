/**
 * Tipos de la base de datos de la plataforma.
 *
 * Se mantienen a mano por ahora; en cuanto el proyecto Supabase exista, se
 * regeneran con:
 *
 * ```bash
 * pnpm --filter @wkg/leaderboard exec supabase gen types typescript \
 *   --project-id <ref> --schema public > src/database.types.ts
 * ```
 *
 * El esquema fuente vive en `supabase/migrations/`.
 */

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          slug: string;
          name: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          slug: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          is_active?: boolean;
        };
        Relationships: [];
      };
      scores: {
        Row: {
          id: string;
          game_slug: string;
          challenge: string;
          nickname: string;
          elapsed_ms: number;
          fails: number;
          device_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          game_slug: string;
          challenge: string;
          nickname: string;
          elapsed_ms: number;
          fails: number;
          device_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'scores_game_slug_fkey';
            columns: ['game_slug'];
            referencedRelation: 'games';
            referencedColumns: ['slug'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

export type ScoreRow = Database['public']['Tables']['scores']['Row'];
export type ScoreInsert = Database['public']['Tables']['scores']['Insert'];
