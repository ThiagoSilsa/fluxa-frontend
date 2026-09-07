// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessService } from '../services/access.service'

// Mappers
import { toOccupancyViewModel } from '../mappers/access.mapper'

// Types
import type { OccupancyViewModel } from '../types/access.types'

/** Intervalo do polling da ocupação (ADR 0010 M5 — Fase 2). */
export const OCCUPANCY_POLLING_INTERVAL_MS = 3000

/**
 * Ocupação em tempo real (`GET /access/occupancy`) com polling de 3s.
 *
 * Reutiliza o padrão de polling da importação (intervalo fixo), mas via
 * `refetchInterval` do TanStack Query: a query refaz o fetch a cada 3s e
 * devolve o viewmodel com os percentuais já calculados.
 *
 * @returns Resultado da query de ocupação (viewmodel).
 */
export function useOccupancyQuery() {
  return useQuery({
    queryKey: ['access-occupancy'],
    queryFn: async () => toOccupancyViewModel(await accessService.getOccupancy()),
    refetchInterval: OCCUPANCY_POLLING_INTERVAL_MS,
    retry: false,
  })
}

/** Tipo do viewmodel de ocupação (para tipar props). */
export type OccupancyQueryResult = OccupancyViewModel | undefined
