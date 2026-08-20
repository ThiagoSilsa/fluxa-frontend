// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { vehiclesService } from '../services/vehicle.service'

// Types
import type { VehicleDetail } from '../types/vehicles.types'

/**
 * Hook que busca o detalhe agregado de um veículo (tipo + departamento +
 * motoristas).
 *
 * Desabilitado quando `vehicleId` é nulo (dialog fechado). É invalidado após
 * mutations de vínculos (departamento/motoristas) para refletir o estado
 * atual.
 *
 * @param vehicleId Id do veículo (ou `null` quando o detalhe está fechado).
 * @returns Resultado da query de detalhe.
 */
export function useVehicleDetailQuery(vehicleId: string | null) {
  return useQuery<VehicleDetail>({
    queryKey: ['vehicle-detail', vehicleId],
    queryFn: () => vehiclesService.get(vehicleId as string),
    enabled: !!vehicleId,
  })
}
