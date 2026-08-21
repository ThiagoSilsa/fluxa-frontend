// TanStack Query
import { useQuery } from '@tanstack/react-query'

// Services
import { devicesService } from '../services/device.service'

// Types
import type { DeviceListParams } from '../types/devices.types'

/**
 * Hook que busca a lista de dispositivos (paginada/ordenada no servidor).
 *
 * A query key inclui busca, filtro de estado, ordenação e paginação — mudar
 * qualquer um deles re-busca no servidor. É invalidada após qualquer mutation
 * de dispositivo (criação/edição/exclusão/rotação de token).
 *
 * @param params Busca, filtros, ordenação e paginação.
 * @returns Resultado da query com o envelope paginado.
 */
export function useDevicesQuery(params: DeviceListParams) {
  return useQuery({
    queryKey: [
      'devices',
      {
        search: params.search,
        isActive: params.isActive,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
        limit: params.limit,
        offset: params.offset,
      },
    ],
    queryFn: () => devicesService.list(params),
  })
}
