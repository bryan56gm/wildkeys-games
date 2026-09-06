import { createContext, useContext, type ReactNode } from 'react';
import type { LeaderboardService } from '../service.js';

const LeaderboardContext = createContext<LeaderboardService | null>(null);
LeaderboardContext.displayName = 'LeaderboardContext';

/** Pone el servicio a disposición de los hooks. Se monta una vez, en la raíz. */
export function LeaderboardProvider({
  service,
  children,
}: {
  service: LeaderboardService;
  children: ReactNode;
}): ReactNode {
  return <LeaderboardContext.Provider value={service}>{children}</LeaderboardContext.Provider>;
}

export function useLeaderboardService(): LeaderboardService {
  const service = useContext(LeaderboardContext);
  if (!service) throw new Error('Falta <LeaderboardProvider> por encima de este componente.');
  return service;
}
