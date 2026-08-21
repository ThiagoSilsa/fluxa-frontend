// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { vehiclesService } from '../services/vehicle.service'

// Types
import type { VehicleListParams } from '../types/vehicles.types'

/**
 * Hook que busca a lista de veículos (paginada/ordenada no servidor).
 *
 * A query key inclui busca, filtros, ordenação e paginação — mudar qualquer
 * um deles re-busca no servidor. É invalidada após qualquer mutation de
 * veículo (inclusive vínculos de departamento/motoristas).
 *
 * @param params Busca, filtros, ordenação e paginação.
 * @returns Resultado da query com o envelope paginado.
 */
export function useVehiclesQuery(params: VehicleListParams) {
  return useQuery({
    queryKey: [
      'vehicles',
      {
        search: params.search,
        vehicleTypeId: params.vehicleTypeId,
        departmentId: params.departmentId,
        freePass: params.freePass,
        isActive: params.isActive,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => vehiclesService.list(params),
  })
}
