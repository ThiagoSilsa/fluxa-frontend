// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { accessRequestService } from '../services/access-request.service'

// Types
import type { VehicleTypeOption } from '../types/access-requests.types'

/**
 * Busca os tipos de veículo ativos (aceite de NEW_VEHICLE/BOTH — o tipo é
 * escolhido pela administração no aceite, regra 22).
 *
 * @returns Tipos de veículo ativos.
 */
export function useVehicleTypesOptionsQuery() {
  return useQuery({
    queryKey: ['access-request-vehicle-types'],
    queryFn: () => accessRequestService.listVehicleTypes(),
    retry: false,
  })
}

/** Tipo do resultado (para tipar props). */
export type VehicleTypesOptionsResult = VehicleTypeOption[] | undefined
