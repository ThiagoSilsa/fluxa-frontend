// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessRequestService } from '../services/access-request.service'

// Types
import type { VehicleOption } from '../types/access-requests.types'

/**
 * Busca veículos para o seletor do cenário NEW_USER/LINK.
 *
 * O buscador é responsável por fazer o debounce do termo antes de chamar o
 * hook (padrão do projeto — `useDebouncedValue`).
 *
 * @param search Termo de busca (ou `null` para desabilitar).
 * @returns Opções de veículo.
 */
export function useVehicleOptionsQuery(search: string | null) {
  return useQuery({
    queryKey: ['access-request-vehicles', search],
    queryFn: () => accessRequestService.listVehicles(search as string),
    enabled: !!search && search.trim().length > 0,
    retry: false,
  })
}

/** Tipo do resultado (para tipar props). */
export type VehicleOptionsResult = VehicleOption[] | undefined
