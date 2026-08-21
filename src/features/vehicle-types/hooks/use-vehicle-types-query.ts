// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { vehicleTypesService } from '../services/vehicle-type.service'

// Types
import type { VehicleTypeListParams } from '../types/vehicle-types.types'

/**
 * Hook que busca a lista de tipos de veículo (paginada no servidor).
 *
 * A query key inclui busca, filtros (`isFleet`/`isActive`) e paginação —
 * mudar qualquer um deles re-busca no servidor. É invalidada após qualquer
 * mutation de tipo de veículo.
 *
 * @param params Busca, filtros e paginação.
 * @returns Resultado da query com o envelope paginado.
 */
export function useVehicleTypesQuery(params: VehicleTypeListParams) {
  return useQuery({
    queryKey: [
      'vehicle-types',
      {
        search: params.search,
        isFleet: params.isFleet,
        isActive: params.isActive,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => vehicleTypesService.list(params),
  })
}
