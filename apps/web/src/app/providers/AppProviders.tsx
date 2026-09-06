import type { ReactNode } from 'react';
import { LeaderboardProvider } from '@wkg/leaderboard';
import { LocaleProvider } from '@/app/i18n/locale';
import { getLeaderboardService } from '@/app/services/leaderboard';

/**
 * Contextos globales de la aplicación: idioma (compartido por todos los
 * juegos) y clasificación (el único servicio con red).
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <LocaleProvider>
      <LeaderboardProvider service={getLeaderboardService()}>{children}</LeaderboardProvider>
    </LocaleProvider>
  );
}
