// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { vehiclesService } from '../services/vehicle.service'

// Types
import type { VehicleQrEntity } from '../types/vehicles.types'

// Shared libs
import { isApiError } from '#/shared/lib/api-error'

/**
 * Hook que busca o QR **ativo** de um veículo.
 *
 * Um 404 do backend significa "sem QR ativo" (nunca emitido, revogado ou
 * reemitido) — o hook devolve `null` nesse caso para a UI oferecer a emissão.
 *
 * @param vehicleId Id do veículo (ou `null` para desabilitar).
 * @returns QR ativo ou `null` (sem QR).
 */
export function useVehicleQrQuery(vehicleId: string | null) {
  return useQuery({
    queryKey: ['vehicle-qr', vehicleId],
    queryFn: async () => {
      try {
        return await vehiclesService.getVehicleQr(vehicleId as string)
      } catch (error) {
        if (isApiError(error) && error.statusCode === 404) {
          return null
        }
        throw error
      }
    },
    enabled: !!vehicleId,
    retry: false,
  })
}

/** Tipo do QR ativo (para tipar o retorno do hook em props). */
export type VehicleQrQueryResult = VehicleQrEntity | null | undefined
